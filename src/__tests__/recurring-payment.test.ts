import { config } from 'dotenv';
import { CreatePlanRequest } from '~/types/createPlan';
import createPlan from '~/functions/createPlan';
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
        const request: CreatePlanRequest = {
            reference: 'TESTING',
            preApproval: {
                name: 'TESTING',
                charge: 'AUTO',
                period: 'MONTHLY',
                amountPerPayment: 200.0,
                membershipFee: 150.0,
                trialPeriodDuration: 28,
                finalDate: new Date(1618323198141),
            },
            maxUses: 500,
        };
        const createdPlan = await createPlan(email as string, token as string, 'development', request);
        expect(createdPlan.preApprovalRequest.code).not.toBe(null || undefined);
    });
});
