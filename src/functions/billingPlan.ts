import fetch from 'node-fetch';
import { BillingPlanRequest, BillingPlanResponse } from '~/types/BillingPlan';
import { Env } from '~/utils/getBaseUrl';
import getRecurringPaymentBaseUrl from '~/utils/getRecurringPaymentBaseUrl';
import { validateReference } from '~/validators/AdherePlan';
import { validateItems } from '~/validators/BillingPlan';

const billingPlan = async (email: string, token: string, env: Env, request: BillingPlanRequest): Promise<BillingPlanResponse> => {
    const validatedRequest: BillingPlanRequest = {
        ...request,
        reference: validateReference(request.reference),
        items: validateItems(request.items),
    };

    const BASE_URL = getRecurringPaymentBaseUrl(env);
    const response = await fetch(`${BASE_URL}/pre-approvals/payment?email=${email}&token=${token}`, {
        method: 'POST',
        body: JSON.stringify(validatedRequest),
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/vnd.pagseguro.com.br.v1+json;charset=ISO-8859-1',
        },
    });
    return response.json() as Promise<BillingPlanResponse>;
};

export default billingPlan;
