export type PaymentType = 'CREDITCARD';

export type DocumentType = 'CPF' | 'CNPJ' | 'PASSPORT';

export type Document = {
    type: DocumentType;
    value: string;
};

export type Phone = {
    areaCode: string;
    number: string;
};

export type Address = {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
};

export type CreditCardHolder = {
    name: string;
    birthDate: string;
    documents?: Document[];
    phone?: Phone;
    billingAddress?: Address;
};

export type CreditCard = {
    token: string;
    holder?: CreditCardHolder;
};

export type PaymentMethod = {
    type: PaymentType;
    creditCard: CreditCard;
};

export type Sender = {
    name: string;
    email: string;
    ip?: string;
    hash?: string;
    phone: Phone;
    address?: Address;
    documents?: Document[];
};

export type AdherePlanRequest = {
    plan: string;
    reference?: string;
    paymentMethod: PaymentMethod;
    sender: Sender;
};

export type AdherePlanResponse = {
    code: string;
};
