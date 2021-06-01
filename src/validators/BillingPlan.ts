import { Item } from '~/types/BillingPlan';
import { formatDecimal } from '~/validators/CreatePlan';
import { Maybe } from '~/types/Maybe';

export const validateItems = (items: Maybe<Item[]>): Maybe<Item[]> => {
    if (!items?.length) {
        return items;
    }
    return items.map(item => ({
        ...item,
        amount: formatDecimal(Number(item.amount)) as string,
        ...(item.shippingCost ? { shippingCost: formatDecimal(Number(item.shippingCost)) } : {}),
        ...(item.weight ? { weight: formatDecimal(Number(item.weight)) } : {}),
    }));
};
