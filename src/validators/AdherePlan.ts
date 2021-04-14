import { CreditCard, CreditCardHolder, Document, PaymentMethod, Phone, Sender } from '~/types/AdherePlan';
import { Maybe } from '~/types/Maybe';

const validateName = (name: string): string => {
    if (!name.length || name.length > 50) {
        throw new Error('Invalid name! This length need to be bigger or equal 1 and lesser or equal 50');
    }
    return name;
};

const validateBirthDate = (birthDate: string): string => {
    if (!/[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}/.test(birthDate)) {
        throw new Error('Invalid birthDate! This need to be in format dd/MM/yyyy');
    }
    return birthDate;
};

const validateCPF = (value: string): string => {
    if (!/[0-9]{11}/.test(value)) {
        throw new Error('Invalid document! CPF is invalid.');
    }
    return value;
};
const validateCNPJ = (value: string): string => {
    if (!/[0-9]{14}/.test(value)) {
        throw new Error('Invalid document! CNPJ is invalid.');
    }
    return value;
};

const validateDocument = (document: Document): Document => {
    if (document.type === 'CPF') {
        return { ...document, value: validateCPF(document.value) };
    }
    if (document.type === 'CNPJ') {
        return { ...document, value: validateCNPJ(document.value) };
    }
    return document;
};

const validateAreaCode = (areaCode: string): string => {
    if (areaCode.length > 2) {
        throw new Error('Invalid areaCode! This length need to be lesser or equal 2');
    }
    if (!/[0-9]{2}/.test(areaCode)) {
        throw new Error('Invalid areaCode! This need to be only numbers');
    }
    return areaCode;
};

const validateNumber = (number: string): string => {
    if (number.length > 9) {
        throw new Error('Invalid number! This length need to be lesser or equal 9');
    }
    if (!/^[0-9]{8}(?:[0-9]{1})?$/.test(number)) {
        throw new Error('Invalid number! This need to be only numbers');
    }
    return number;
};

export const validateReference = (reference: Maybe<string>): Maybe<string> => {
    if (!reference) {
        return reference;
    }
    if (reference.length > 200) {
        throw new Error('Invalid reference! This length need to be lesser or equal 200');
    }
    return reference;
};

const validateEmail = (email: string) => {
    if (email.length > 60) {
        throw new Error('Invalid email! Max length is 60');
    }
    return email;
};

export const validateIp = (ip: Maybe<string>, hash: Maybe<string>): Maybe<string> => {
    if (!ip && !hash) {
        throw new Error('Invalid ip! This is required when hash is unset');
    }
    if (ip && !/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(ip)) {
        throw new Error('Invalid ip! Wrong syntax');
    }
    return ip;
};

const validatePhone = (phone: Maybe<Phone>): Maybe<Phone> => {
    if (!phone) {
        return phone;
    }
    return { areaCode: validateAreaCode(phone.areaCode), number: validateNumber(phone.number) };
};

const validateHolder = (holder: Maybe<CreditCardHolder>): Maybe<CreditCardHolder> => {
    if (!holder) {
        return holder;
    }
    return {
        ...holder,
        documents: holder.documents?.map(validateDocument),
        birthDate: validateBirthDate(holder.birthDate),
        phone: validatePhone(holder.phone),
        name: validateName(holder.name),
    };
};

const validateCreditCard = (creditCard: CreditCard): CreditCard => {
    return {
        ...creditCard,
        holder: validateHolder(creditCard.holder),
    };
};

export const validatePaymentMethod = (paymentMethod: PaymentMethod): PaymentMethod => {
    return {
        ...paymentMethod,
        creditCard: validateCreditCard(paymentMethod.creditCard),
    };
};

export const validateSender = (sender: Sender): Sender => {
    return {
        ...sender,
        documents: sender.documents?.map(validateDocument),
        email: validateEmail(sender.email),
        ip: validateIp(sender.ip, sender.hash),
        name: validateName(sender.name),
    };
};
