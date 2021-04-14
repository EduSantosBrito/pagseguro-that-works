import { CreditCard, PaymentType, Sender } from '~/types/AdherePlan';

export type RetryPaymentRequest = {
    type: PaymentType;
    sender: Omit<Sender, 'name' | 'email' | 'phone' | 'address' | 'documents'>;
    creditCard: CreditCard;
};

export type RetryPaymentResponse = {
    date: string;
    transactionCode: string;
};
