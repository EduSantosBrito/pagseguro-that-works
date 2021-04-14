import { config } from 'dotenv';
import fetch, { Response } from 'node-fetch';
import { Page } from 'puppeteer';
import adherePlan from '~/functions/adherePlan';
import createPlan from '~/functions/createPlan';
import getSession from '~/functions/getSession';
import retryPayment from '~/functions/retryPayment';
import { AdherePlanRequest } from '~/types/AdherePlan';
import { CreatePlanRequest } from '~/types/CreatePlan';
import { Maybe } from '~/types/Maybe';
import { RetryPaymentRequest } from '~/types/RetryPayment';

let email: Maybe<string>;
let token: Maybe<string>;
let planId: Maybe<string>;
let sessionId: Maybe<string>;
let preApprovalCode: Maybe<string>;

type PagseguroWindow = Window &
    typeof globalThis & {
        PagSeguroDirectPayment: {
            setSessionId: (sessionId: string) => void;
            onSenderHashReady: (callback: (response: { senderHash: string; status: string }) => void) => void;
            createCardToken: (config: {
                cardNumber: string;
                brand: string;
                cvv: string;
                expirationMonth: string;
                expirationYear: string;
                success: (response: { card: { token: string } }) => void;
            }) => string;
        };
    };

const evaluatePage = async ([id]: string[]) => {
    return new Promise<{ senderHash: string; cardToken: string }>(resolve => {
        const { PagSeguroDirectPayment } = window as PagseguroWindow;
        PagSeguroDirectPayment?.setSessionId(id);
        PagSeguroDirectPayment?.createCardToken({
            cardNumber: '4111111111111111', // Número do cartão de crédito
            brand: 'visa', // Bandeira do cartão
            cvv: '013', // CVV do cartão
            expirationMonth: '12', // Mês da expiração do cartão
            expirationYear: '2026', // Ano da expiração do cartão, é necessário os 4 dígitos.
            success: responseSuccess => {
                PagSeguroDirectPayment?.onSenderHashReady(({ senderHash }) => {
                    resolve({ senderHash, cardToken: responseSuccess.card.token });
                });
            },
        });
    });
};

const generatePlanData = async () => {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    return page.evaluate(evaluatePage, sessionId as string);
};

const extractTextFromResponse = (response: Response) => (response.status === 200 ? response.text().then(text => text) : '');

const sendCaptcha = async (sitekey: string, url: string) => {
    const captchaDataString = [
        `key=${process.env.CAPTCHA_TOKEN as string}`,
        'method=userrecaptcha',
        `googlekey=${sitekey}`,
        `pageurl=${url}`,
    ].join('&');

    return fetch(`https://2captcha.com/in.php?${captchaDataString}`)
        .then(payload => extractTextFromResponse(payload))
        .then(payload => {
            if (!payload || payload.substr(0, 2) !== 'OK') {
                return '';
            }
            return payload.substr(3);
        })
        .catch(() => {
            return '';
        });
};

// Helper delay function
const delay = (value: number) => new Promise(res => setTimeout(res, value));

// Function that waits for a response
async function poolResponse(requestId: string, counter = 0, counterLimit = 3, waitTime = 20000, decrementWaitTimeBy = 5000) {
    if (counter === counterLimit || waitTime < 0) {
        return '';
    }
    await delay(waitTime - decrementWaitTimeBy); // Wait some time
    const dataStringRes = [`key=${process.env.CAPTCHA_TOKEN as string}`, 'action=GET', `id=${requestId}`, 'json=0'].join('&');
    return fetch(`https://2captcha.com/res.php?${dataStringRes}`)
        .then(payload => extractTextFromResponse(payload))
        .catch(() => {
            return '';
        });
}

const handleCaptcha = async (sitekey: string, url: string) => {
    const requestId = await sendCaptcha(sitekey, url);
    if (!requestId) {
        return '';
    }
    const results = await Promise.all(
        Array.from(new Array(3), () => '').map(async (_, index) => {
            const payload = await poolResponse(requestId, index, 3);
            if (payload === 'CAPCHA_NOT_READY') {
                return '';
            }
            if (!payload || payload.substr(0, 2) !== 'OK') {
                return '';
            }
            return payload;
        }),
    );
    return results.find(result => !!result) as string;
};

const alterPaymentOrderStatus = async (pagseguroPage: Page, paymentOrderCode: string, orderPageUrl: string) => {
    await pagseguroPage.goto(`https://sandbox.pagseguro.uol.com.br${orderPageUrl}`);
    await pagseguroPage.waitForSelector('#preapprovalpayment-transaction-list > tbody > tr');
    await pagseguroPage.click('#preapprovalpayment-transaction-list > tbody > tr');
    await pagseguroPage.waitForSelector('span#change-status-link.link');
    await pagseguroPage.waitForTimeout(500);
    await pagseguroPage.click('span#change-status-link.link');
    await pagseguroPage.evaluate(() => {
        const el: HTMLSelectElement = <HTMLSelectElement>document.querySelectorAll('select[name="status"]')[1];
        el.selectedIndex = 2;
        const button = <HTMLButtonElement>(
            document.querySelector(
                '#cboxLoadedContent > div > form > div.button-wrapper.center > button.submit-modal.pagseguro-button.disabled',
            )
        );
        button.disabled = false;
    });
    await pagseguroPage.waitForSelector(
        '#cboxLoadedContent > div > form > div.button-wrapper.center > button.submit-modal.pagseguro-button',
    );
    await pagseguroPage.click('#cboxLoadedContent > div > form > div.button-wrapper.center > button.submit-modal.pagseguro-button');
};

const getPaymentOrderCode = async (subscriptionCode: string) => {
    const response = await fetch(
        `https://ws.sandbox.pagseguro.uol.com.br/pre-approvals/${subscriptionCode}/payment-orders?email=${
            process.env.PAGSEGURO_EMAIL as string
        }&token=${process.env.PAGSEGURO_TOKEN as string}`,
        {
            headers: {
                Accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1',
                'Content-Type': 'application/json',
            },
        },
    );
    const {
        paymentOrders,
    }: {
        paymentOrders: Record<string, { status: number }>;
    } = await response.json();
    return Object.values(paymentOrders).find(paymentOrder => paymentOrder.status === 2) as Record<string, unknown>;
};

const alterPaymentStatus = async (subscriptionCode: string) => {
    const pagseguroPage = await browser.newPage();
    await pagseguroPage.goto(`https://sandbox.pagseguro.uol.com.br/assinaturas/detalhes.html?code=${subscriptionCode}`);
    await pagseguroPage.type('input[type=email]', process.env.PAGSEGURO_EMAIL as string);
    await pagseguroPage.type('input[type=password]', process.env.PAGSEGURO_PASSWORD as string);
    await pagseguroPage.click('#__next > div > div > main > div > form > div > div > div > div > div.CMWx_ > button');
    const sitekey = await pagseguroPage.$eval(
        '#recaptchaPlaceholder > div > div.grecaptcha-logo > iframe',
        el => el?.getAttribute('src')?.split('&k=')[1].split('&')[0],
    );
    const url = `https://acesso.pagseguro.uol.com.br/sandbox?dest=https://sandbox.pagseguro.uol.com.br/assinaturas/detalhes.html?code=${subscriptionCode}`;
    await handleCaptcha(sitekey as string, url);
    await pagseguroPage.waitForSelector('#preapproval-timeline-list > tbody > tr > td.col-actions > span');
    await pagseguroPage.click('#preapproval-timeline-list > tbody > tr > td.col-actions > span');
    await pagseguroPage.waitForSelector('#cboxLoadedContent > div > form > select');
    await pagseguroPage.select('#cboxLoadedContent > div > form > select', 'PAY');
    await pagseguroPage.waitForSelector('#cboxLoadedContent > div > form > div > button.submit-modal.pagseguro-button');
    await pagseguroPage.click('#cboxLoadedContent > div > form > div > button.submit-modal.pagseguro-button');
    const paymentOrder = await getPaymentOrderCode(preApprovalCode as string);
    const { code: paymentOrderCode } = paymentOrder as {
        code: string;
    };
    const orderPageUrl = await pagseguroPage.$eval('#preapproval-history-list > tbody > tr:nth-child(2)', el =>
        el.getAttribute('data-content-url'),
    );
    await alterPaymentOrderStatus(pagseguroPage, paymentOrderCode, orderPageUrl as string);
    return paymentOrderCode;
};

beforeAll(() => {
    config();
    email = process.env.PAGSEGURO_EMAIL;
    token = process.env.PAGSEGURO_TOKEN;
});

describe('Recurring Payment', () => {
    it('Can create a plan', async () => {
        const finalDate = new Date();
        finalDate.setMonth(finalDate.getMonth() + 1);
        const request: CreatePlanRequest = {
            reference: finalDate.toISOString(),
            preApproval: {
                name: finalDate.toISOString(),
                charge: 'AUTO',
                period: 'MONTHLY',
                amountPerPayment: 200.0,
                membershipFee: 15000.0,
                trialPeriodDuration: 28,
                finalDate,
            },
            maxUses: 500,
        };
        const createPlanResponse = await createPlan(email as string, token as string, 'development', request);
        [planId] = createPlanResponse.preApprovalRequest.code;
        expect(planId).not.toBe(null || undefined);
    });
    it('Can get session', async () => {
        const sessionResponse = await getSession(email as string, token as string, 'development');
        sessionId = sessionResponse.session.id;
        expect(sessionId).not.toBe(null || undefined);
    });
    it('Can adhere to a plan', async () => {
        const planData = await generatePlanData();
        const request: AdherePlanRequest = {
            plan: planId as string,
            reference: new Date().toISOString(),
            paymentMethod: {
                type: 'CREDITCARD',
                creditCard: {
                    token: planData.cardToken,
                    holder: {
                        name: 'Nome Comprador',
                        birthDate: '11/01/1984',
                        documents: [
                            {
                                type: 'CPF',
                                value: '00000000191',
                            },
                        ],
                        billingAddress: {
                            street: 'Av. Brigadeiro Faria Lima',
                            number: '1384',
                            complement: '3 andar',
                            district: 'Jd. Paulistano',
                            city: 'São Paulo',
                            state: 'SP',
                            country: 'BRA',
                            postalCode: '01452002',
                        },
                        phone: {
                            areaCode: '11',
                            number: '988881234',
                        },
                    },
                },
            },
            sender: {
                email: 'test@sandbox.pagseguro.com.br',
                name: 'Sender Name',
                hash: planData.senderHash,
                address: {
                    street: 'Av. Brigadeira Faria Lima',
                    number: '1384',
                    complement: '3 andar',
                    district: 'Jd. Paulistano',
                    city: 'São Paulo',
                    state: 'SP',
                    country: 'BRA',
                    postalCode: '01452002',
                },
                documents: [
                    {
                        type: 'CPF',
                        value: '00000000191',
                    },
                ],
                phone: {
                    areaCode: '11',
                    number: '988881234',
                },
            },
        };
        const adherePlanResponse = await adherePlan(email as string, token as string, 'development', request);
        preApprovalCode = adherePlanResponse.code;
        expect(preApprovalCode).not.toBe(null || undefined);
    }, 60000);
    it('Can retry payment', async () => {
        const paymentOrderCode = await alterPaymentStatus(preApprovalCode as string);
        const planData = await generatePlanData();
        const request: RetryPaymentRequest = {
            type: 'CREDITCARD',
            sender: {
                hash: planData.senderHash,
            },
            creditCard: {
                token: planData.cardToken,
                holder: {
                    name: 'Nome Comprador',
                    birthDate: '11/01/1984',
                    documents: [
                        {
                            type: 'CPF',
                            value: '00000000191',
                        },
                    ],
                    billingAddress: {
                        street: 'Av. Brigadeiro Faria Lima',
                        number: '1384',
                        complement: '3 andar',
                        district: 'Jd. Paulistano',
                        city: 'São Paulo',
                        state: 'SP',
                        country: 'BRA',
                        postalCode: '01452002',
                    },
                    phone: {
                        areaCode: '11',
                        number: '988881234',
                    },
                },
            },
        };
        const retryPaymentResponse = await retryPayment(
            email as string,
            token as string,
            'development',
            request,
            preApprovalCode as string,
            paymentOrderCode,
        );

        expect(retryPaymentResponse.transactionCode).not.toBe(null || undefined);
    }, 180000);
});
