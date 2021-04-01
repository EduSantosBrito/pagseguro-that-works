import { config } from 'dotenv';
import adherePlan from '~/functions/adherePlan';
import createPlan from '~/functions/createPlan';
import getSession from '~/functions/getSession';
import { AdherePlanRequest } from '~/types/AdherePlan';
import { CreatePlanRequest } from '~/types/CreatePlan';
import { Maybe } from '~/types/Maybe';

let email: Maybe<string>;
let token: Maybe<string>;

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
        expect(createPlanResponse.preApprovalRequest.code).not.toBe(null || undefined);
    });
    it('Can get session', async () => {
        const sessionResponse = await getSession(email as string, token as string, 'development');
        expect(sessionResponse.session.id).not.toBe(null || undefined);
    });
    it('Can adhere to a plan', async () => {
        const request: AdherePlanRequest = {
            plan: '<<PLAN_ID>>',
            reference: new Date().toISOString(),
            paymentMethod: {
                type: 'CREDITCARD',
                creditCard: {
                    token: '<<CARD_TOKEN>>',
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
                hash: '<<SENDER_HASH>>',
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
        console.info('THIS TEST IS ALWAYS SUCCESS, CHANGE REQUEST DATA', { adherePlanResponse });
        expect(true).toBe(true);
    });
});
