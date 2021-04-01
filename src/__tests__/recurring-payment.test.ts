import { config } from 'dotenv';
import { CreatePlanRequest } from '~/types/createPlan';
import createPlan from '~/functions/createPlan';
import { Maybe } from '~/types/Maybe';
import getSession from '~/functions/getSession';

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
                membershipFee: 150.0,
                trialPeriodDuration: 28,
                finalDate,
            },
            maxUses: 500,
        };
        const createdPlan = await createPlan(email as string, token as string, 'development', request);
        expect(createdPlan.preApprovalRequest.code).not.toBe(null || undefined);
    });
    it('Can get session', async () => {
        const sessionResponse = await getSession(email as string, token as string, 'development');
        expect(sessionResponse.session.id).not.toBe(null || undefined);
    });
});
