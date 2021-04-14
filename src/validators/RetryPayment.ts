import { Sender } from '~/types/AdherePlan';
import { validateIp } from '~/validators/AdherePlan';

export const validateSender = (
    sender: Omit<Sender, 'name' | 'email' | 'phone' | 'address' | 'documents'>,
): Omit<Sender, 'name' | 'email' | 'phone' | 'address' | 'documents'> => {
    return {
        ...sender,
        ip: validateIp(sender.ip, sender.hash),
    };
};
