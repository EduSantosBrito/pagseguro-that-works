import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import { Env } from '~/utils/getBaseUrl';
import getRecurringPaymentBaseUrl from '~/utils/getRecurringPaymentBaseUrl';

type GetSessionResponse = {
    session: {
        id: string;
    };
};

const getSession = async (email: string, token: string, env: Env): Promise<GetSessionResponse> => {
    const BASE_URL = getRecurringPaymentBaseUrl(env);
    const response = await fetch(`${BASE_URL}/sessions?email=${email}&token=${token}`, { method: 'POST' });
    const data = await response.text();
    const cleanedString = data.replace('\ufeff', '');
    return parseStringPromise(cleanedString) as Promise<GetSessionResponse>;
};

export default getSession;
