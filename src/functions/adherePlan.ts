import fetch from 'node-fetch';
import { AdherePlanRequest, AdherePlanResponse } from '~/types/AdherePlan';
import { validatePaymentMethod, validateReference, validateSender } from '~/validators/AdherePlan';
import { Env } from '~/utils/getBaseUrl';
import getRecurringPaymentBaseUrl from '~/utils/getRecurringPaymentBaseUrl';

const adherePlan = async (email: string, token: string, env: Env, request: AdherePlanRequest): Promise<AdherePlanResponse> => {
    const BASE_URL = getRecurringPaymentBaseUrl(env);
    const validatedRequest: AdherePlanRequest = {
        ...request,
        reference: validateReference(request.reference),
        paymentMethod: validatePaymentMethod(request.paymentMethod),
        sender: validateSender(request.sender),
    };
    const response = await fetch(`${BASE_URL}/pre-approvals?email=${email}&token=${token}`, {
        method: 'POST',
        body: JSON.stringify(validatedRequest),
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1',
        },
    });
    return response.json() as Promise<AdherePlanResponse>;
};

export default adherePlan;
