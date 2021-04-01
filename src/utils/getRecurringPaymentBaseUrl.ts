import { Env } from '~/utils/getBaseUrl';

type RecurringPaymentBaseUrl = 'https://ws.pagseguro.uol.com.br' | 'https://ws.sandbox.pagseguro.uol.com.br';

type EnvUrl = {
    [x in Env]: RecurringPaymentBaseUrl;
};

const envUrl: EnvUrl = {
    production: 'https://ws.pagseguro.uol.com.br',
    development: 'https://ws.sandbox.pagseguro.uol.com.br',
};

const getRecurringPaymentBaseUrl = (env: Env) => envUrl[env];

export default getRecurringPaymentBaseUrl;
