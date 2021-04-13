import { config } from 'dotenv';
import adherePlan from '~/functions/adherePlan';
import createPlan from '~/functions/createPlan';
import getSession from '~/functions/getSession';
import { AdherePlanRequest } from '~/types/AdherePlan';
import { CreatePlanRequest } from '~/types/CreatePlan';
import { Maybe } from '~/types/Maybe';

let email: Maybe<string>;
let token: Maybe<string>;
let planId: Maybe<string>;
let sessionId: Maybe<string>;

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        PagSeguroDirectPayment?.setSessionId(id);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        PagSeguroDirectPayment?.createCardToken({
            cardNumber: '4111111111111111', // Número do cartão de crédito
            brand: 'visa', // Bandeira do cartão
            cvv: '013', // CVV do cartão
            expirationMonth: '12', // Mês da expiração do cartão
            expirationYear: '2026', // Ano da expiração do cartão, é necessário os 4 dígitos.
            success: responseSuccess => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                PagSeguroDirectPayment?.onSenderHashReady(({ senderHash }) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        expect(adherePlanResponse.code).not.toBe(null || undefined);
    }, 60000);
});
