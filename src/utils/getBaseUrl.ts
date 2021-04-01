type BaseUrl = 'https://pagseguro.uol.com.br/v2' | 'https://sandbox.pagseguro.uol.com.br/v2';
export type Env = 'production' | 'development';

type EnvUrl = {
    [x in Env]: BaseUrl;
};

const envUrl: EnvUrl = {
    production: 'https://pagseguro.uol.com.br/v2',
    development: 'https://sandbox.pagseguro.uol.com.br/v2',
};

const getBaseUrl = (env: Env) => envUrl[env];

export default getBaseUrl;
