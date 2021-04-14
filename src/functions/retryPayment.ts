import fetch from 'node-fetch';
import { RetryPaymentRequest, RetryPaymentResponse } from '~/types/RetryPayment';
import { Env } from '~/utils/getBaseUrl';
import getRecurringPaymentBaseUrl from '~/utils/getRecurringPaymentBaseUrl';
import { validateSender } from '~/validators/RetryPayment';

/**
 * Steps to get paymentOrderCode
 * 1- Menu Assinaturas
 * 2- Entrar em uma assinatura
 * 3- Simula evento - Sessao Linha do Tempo
 * 4- Clicar na ordem de pagamento com Em processamento
 * 5- Clicar em transacoes
 * 6- Alterar status para nao paga
 * 7- Codigo da transacao === paymentOrderCode
 */

const retryPayment = async (
    email: string,
    token: string,
    env: Env,
    request: RetryPaymentRequest,
    preApprovalCode: string,
    paymentOrderCode: string,
): Promise<RetryPaymentResponse> => {
    const BASE_URL = getRecurringPaymentBaseUrl(env);
    const validatedRequest: RetryPaymentRequest = {
        ...request,
        sender: validateSender(request.sender),
    };
    const response = await fetch(
        `${BASE_URL}/pre-approvals/${preApprovalCode}/payment-orders/${paymentOrderCode}/payment?email=${email}&token=${token}`,
        {
            method: 'POST',
            body: JSON.stringify(validatedRequest),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/vnd.pagseguro.com.br.v1+json;charset=ISO-8859-1',
            },
        },
    );
    return response.json() as Promise<RetryPaymentResponse>;
};

export default retryPayment;
