type BaseUrl =
    | 'https://pagseguro.uol.com.br/v2'
    | 'https://sandbox.pagseguro.uol.com.br/v2'
    | 'https://pagseguro.uol.com.br'
    | 'https://sandbox.pagseguro.uol.com.br';
export type Env = 'production' | 'development';

type EnvUrl = {
    [x in Env]: BaseUrl;
};

const envUrl: EnvUrl = {
    production: 'https://pagseguro.uol.com.br',
    development: 'https://sandbox.pagseguro.uol.com.br',
};

const getBaseUrl = (env: Env, withV2 = true) => `${envUrl[env]}${withV2 ? '/v2' : ''}}`;

export default getBaseUrl;
