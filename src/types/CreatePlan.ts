export type Charge = 'AUTO' | 'MANUAL';
export type Period = 'WEEKLY' | 'MONTHLY' | 'BIMONTHLY' | 'TRIMONTHLY' | 'SEMIANNUALLY' | 'YEARLY';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type Expiration = {
    value: number;
    unit: string;
};

export type PreApproval = {
    name: string;
    charge: Charge;
    period: Period;
    amountPerPayment?: number;
    membershipFee?: number;
    trialPeriodDuration?: number;
    expiration?: Expiration;
    details?: string;
    maxAmountPerPeriod?: number;
    maxAmountPerPayment?: number;
    maxTotalAmount?: number;
    maxPaymentsPerPeriod?: number;
    initialDate?: Date;
    finalDate?: Date;
    dayOfYear?: string;
    dayOfMonth?: string;
    dayOfWeek?: DayOfWeek;
    cancelURL?: string;
};

export type ValidatedPreApproval = Omit<
    PreApproval,
    'initialDate' | 'finalDate' | 'amountPerPayment' | 'maxTotalAmount' | 'membershipFee' | 'maxAmountPerPeriod' | 'maxAmountPerPayment'
> & {
    initialDate?: string;
    finalDate?: string;
    amountPerPayment?: string;
    maxTotalAmount?: string;
    membershipFee?: string;
    maxAmountPerPeriod?: string;
    maxAmountPerPayment?: string;
};

export type Receiver = {
    email: string;
};

export type CreatePlanRequest = {
    redirectURL?: string;
    reference: string;
    preApproval: PreApproval;
    reviewURL?: string;
    maxUses?: number;
    receiver?: Receiver;
};

export type ValidatedCreatePlanRequest = Omit<CreatePlanRequest, 'preApproval'> & {
    preApproval: ValidatedPreApproval;
};

export type CreatePlanResponse = {
    preApprovalRequest: {
        code: string;
        date: string;
    };
};
