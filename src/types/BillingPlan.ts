export type Item = {
    id: string;
    description: string;
    quantity: string;
    amount: string;
    weight?: string;
    shippingCost?: string;
};

export type BillingPlanRequest = {
    preApprovalCode: string;
    senderHash?: string;
    reference?: string;
    senderIp?: string;
    items?: Item[];
};

export type BillingPlanResponse = {
    transactionCode: string;
    date: string;
};
