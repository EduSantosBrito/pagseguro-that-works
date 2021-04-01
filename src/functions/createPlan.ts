import fetch from 'node-fetch';
import objectToXml from 'object-to-xml';
import rundef from 'rundef';
import { parseStringPromise } from 'xml2js';
import { CreatePlanRequest, CreatePlanResponse, ValidatedCreatePlanRequest } from '~/types/CreatePlan';
import { Env } from '~/utils/getBaseUrl';
import getRecurringPaymentBaseUrl from '~/utils/getRecurringPaymentBaseUrl';
import { validatePreApproval, validateReceiver } from '~/validators/CreatePlan';

const generateXML = (request: ValidatedCreatePlanRequest) => {
    const xmlHeader = '?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?';
    const xml: string = objectToXml({
        [`${xmlHeader}`]: null,
        preApprovalRequest: {
            '#': request,
        },
    }) as string;
    return xml;
};

const createPlan = async (email: string, token: string, env: Env, request: CreatePlanRequest): Promise<CreatePlanResponse> => {
    const validatedRequest: ValidatedCreatePlanRequest = {
        ...request,
        preApproval: validatePreApproval(request.preApproval),
        receiver: validateReceiver(request.receiver),
    };
    const BASE_URL = getRecurringPaymentBaseUrl(env);
    const generatedXML = generateXML(rundef(validatedRequest, false, true));
    const response = await fetch(`${BASE_URL}/pre-approvals/request?email=${email}&token=${token}`, {
        method: 'POST',
        headers: {
            Accept: 'application/vnd.pagseguro.com.br.v3+xml;charset=ISO-8859-1',
            'Content-Type': 'application/xml;charset=ISO-8859-1',
        },
        body: generatedXML,
    });
    const data = await response.text();
    return parseStringPromise(data) as Promise<CreatePlanResponse>;
};

export default createPlan;
