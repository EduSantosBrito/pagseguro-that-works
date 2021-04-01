import { Charge, DayOfWeek, Expiration, Period, PreApproval, Receiver, ValidatedPreApproval } from '~/types/CreatePlan';
import { Maybe } from '~/types/Maybe';

const validateEmail = (email: string) => {
    if (email.length > 60) {
        throw new Error('Invalid email! Max length is 60');
    }
    return email;
};

const validateDayOfYear = (
    dayOfYear: Maybe<string>,
    dayOfWeek: Maybe<DayOfWeek>,
    dayOfMonth: Maybe<string>,
    charge: Charge,
    period: Period,
): Maybe<string> => {
    if (!dayOfYear) {
        return dayOfYear;
    }
    if (period !== 'YEARLY') {
        throw new Error('Invalid dayOfYear! This can only be used with period equal YEARLY');
    }
    if (charge === 'AUTO') {
        throw new Error('Invalid dayOfYear! This can not be used with charge equal AUTO');
    }
    if (dayOfMonth || dayOfWeek) {
        throw new Error('Invalid dayOfYear! This can not be used with dayOfMonth or dayOfWeek');
    }
    if (!/[0-1][0-9]-[0-3][0-9]/.test(dayOfYear)) {
        throw new Error('Invalid dayOfYear! This need to be in the format MM-dd');
    }
    return dayOfYear;
};

const validateDayOfMonth = (
    dayOfMonth: Maybe<string>,
    dayOfWeek: Maybe<DayOfWeek>,
    dayOfYear: Maybe<string>,
    charge: Charge,
    period: Period,
): Maybe<string> => {
    if (!dayOfMonth) {
        return dayOfYear;
    }
    if (period === 'WEEKLY' || period === 'YEARLY') {
        throw new Error('Invalid dayOfMonth! This can only be used with period equal MONTHLY, BIMONTHLY, TRIMONTHLY or SEMIANNUALLY.');
    }
    if (charge === 'AUTO') {
        throw new Error('Invalid dayOfMonth! This can not be used with charge equal AUTO');
    }
    if (dayOfYear || dayOfWeek) {
        throw new Error('Invalid dayOfMonth! This can not be used with dayOfYear or dayOfWeek');
    }
    if (!/[0-3][0-9]/.test(dayOfMonth)) {
        throw new Error('Invalid dayOfMonth! This need to be in the format dd');
    }
    return dayOfMonth;
};

const validateDayOfWeek = (
    dayOfWeek: Maybe<DayOfWeek>,
    dayOfMonth: Maybe<string>,
    dayOfYear: Maybe<string>,
    charge: Charge,
    period: Period,
): Maybe<DayOfWeek> => {
    if (!dayOfWeek) {
        return dayOfWeek;
    }
    if (period !== 'WEEKLY') {
        throw new Error('Invalid dayOfWeek! This can only be used with period equal WEEKLY.');
    }
    if (charge === 'AUTO') {
        throw new Error('Invalid dayOfWeek! This can not be used with charge equal AUTO');
    }
    if (dayOfYear || dayOfMonth) {
        throw new Error('Invalid dayOfWeek! This can not be used with dayOfYear or dayOfMonth');
    }
    return dayOfWeek;
};

const validateFinalDate = (finalDate: Maybe<Date>, initialDate: Maybe<Date>, expiration: Maybe<Expiration>): Maybe<Date> => {
    if (finalDate && expiration) {
        throw new Error('Invalid finalDate! This cant be used with expiration');
    }
    if (!finalDate && !expiration) {
        throw new Error('Invalid finalDate! This is required if expiration is null or undefined');
    }
    return finalDate;
};

const validateInitialDate = (initialDate: Maybe<Date>, expiration: Maybe<Expiration>, charge: Charge): Maybe<Date> => {
    if (initialDate && expiration) {
        throw new Error('Invalid initialDate! This cant be used with expiration');
    }
    if (!initialDate) {
        return initialDate;
    }
    if (charge === 'AUTO') {
        throw new Error('Invalid initialDate! This can not be used with charge equal AUTO');
    }
    const today = new Date();
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    const todayInMs = today.getTime();
    const twoYearsFromNowInMS = twoYearsFromNow.getTime();
    const initialDateInMs = initialDate.getTime();

    if (initialDateInMs < todayInMs) {
        throw new Error('Invalid initialDate! This cant be lesser than today');
    }

    if (initialDateInMs > twoYearsFromNowInMS) {
        throw new Error('Invalid initialDate! This cant be bigger than two years from now');
    }

    return initialDate;
};

const formatDate = (date: Maybe<Date>): Maybe<string> => (date ? date.toISOString() : date);

const validateTrialPeriodDuration = (trialPeriodDuration: Maybe<number>): Maybe<number> => {
    if (!trialPeriodDuration) {
        return trialPeriodDuration;
    }
    if (trialPeriodDuration < 1) {
        throw new Error('Invalid trialPeriodDuration! This need to be bigger or equal than 1');
    }
    if (trialPeriodDuration > 1_000_000) {
        throw new Error('Invalid trialPeriodDuration! This need to be lesser or equal than 1.000.000');
    }
    return trialPeriodDuration;
};

const validateName = (name: string): string => {
    if (name.length > 100) {
        throw new Error('Invalid name! This length need to be lesser or equal than 100');
    }
    return name;
};

const validateMembershipFee = (membershipFee: Maybe<number>): Maybe<number> => {
    if (!membershipFee) {
        return membershipFee;
    }
    if (membershipFee < 0) {
        throw new Error('Invalid membershipFee! This need to be bigger or equal than 0');
    }
    if (membershipFee > 1_000_000) {
        throw new Error('Invalid membershipFee! This need to be lesser or equal than 1.000.000,00');
    }
    return membershipFee;
};

const validateMaxPaymentsPerPeriod = (maxPaymentsPerPeriod: Maybe<number>, charge: Charge): Maybe<number> => {
    if (maxPaymentsPerPeriod && charge === 'AUTO') {
        throw new Error('Invalid maxPaymentsPerPeriod! This can not be used with charge equal AUTO');
    }
    return maxPaymentsPerPeriod;
};

const validateMaxAmountPerPeriod = (maxAmountPerPeriod: Maybe<number>, charge: Charge): Maybe<number> => {
    if (maxAmountPerPeriod && charge === 'AUTO') {
        throw new Error('Invalid maxAmountPerPeriod! This can not be used with charge equal AUTO');
    }
    return maxAmountPerPeriod;
};
const validateMaxAmountPerPayment = (maxAmountPerPayment: Maybe<number>, charge: Charge): Maybe<number> => {
    if (maxAmountPerPayment && charge === 'AUTO') {
        throw new Error('Invalid maxAmountPerPayment! This can not be used with charge equal AUTO');
    }
    return maxAmountPerPayment;
};

const validateAmountPerPayment = (amountPerPayment: Maybe<number>, charge: Charge): Maybe<number> => {
    if (!amountPerPayment && charge === 'MANUAL') {
        return amountPerPayment;
    }
    if (!amountPerPayment && charge === 'AUTO') {
        throw new Error('Invalid amountPerPayment! This is required with charge equal AUTO');
    }
    if (amountPerPayment && amountPerPayment < 1) {
        throw new Error('Invalid amountPerPayment! This need to be bigger or equal than 1,00');
    }
    if (amountPerPayment && amountPerPayment > 2000) {
        throw new Error('Invalid amountPerPayment! This need to be lesser or equal than 2.000,00');
    }
    return amountPerPayment;
};

const formatDecimal = (numberToFormat: Maybe<number>): Maybe<string> => (numberToFormat ? numberToFormat.toFixed(2) : undefined);

export const validatePreApproval = (preApproval: PreApproval): ValidatedPreApproval => {
    return {
        ...preApproval,
        name: validateName(preApproval.name),
        amountPerPayment: formatDecimal(validateAmountPerPayment(preApproval.amountPerPayment, preApproval.charge)),
        membershipFee: formatDecimal(validateMembershipFee(preApproval.membershipFee)),
        trialPeriodDuration: validateTrialPeriodDuration(preApproval.trialPeriodDuration),
        maxAmountPerPeriod: formatDecimal(validateMaxAmountPerPeriod(preApproval.maxAmountPerPeriod, preApproval.charge)),
        maxAmountPerPayment: formatDecimal(validateMaxAmountPerPayment(preApproval.maxAmountPerPayment, preApproval.charge)),
        maxTotalAmount: formatDecimal(preApproval.maxTotalAmount),
        maxPaymentsPerPeriod: validateMaxPaymentsPerPeriod(preApproval.maxPaymentsPerPeriod, preApproval.charge),
        initialDate: formatDate(validateInitialDate(preApproval.initialDate, preApproval.expiration, preApproval.charge)),
        finalDate: formatDate(validateFinalDate(preApproval.finalDate, preApproval.initialDate, preApproval.expiration)),
        dayOfYear: validateDayOfYear(
            preApproval.dayOfYear,
            preApproval.dayOfWeek,
            preApproval.dayOfMonth,
            preApproval.charge,
            preApproval.period,
        ),
        dayOfMonth: validateDayOfMonth(
            preApproval.dayOfMonth,
            preApproval.dayOfWeek,
            preApproval.dayOfYear,
            preApproval.charge,
            preApproval.period,
        ),
        dayOfWeek: validateDayOfWeek(
            preApproval.dayOfWeek,
            preApproval.dayOfMonth,
            preApproval.dayOfYear,
            preApproval.charge,
            preApproval.period,
        ),
    };
};

export const validateReceiver = (receiver: Maybe<Receiver>): Maybe<Receiver> => {
    if (!receiver) {
        return receiver;
    }
    return {
        email: validateEmail(receiver.email),
    };
};
