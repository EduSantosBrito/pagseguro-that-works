<h1 align="center">Welcome to pagseguro-that-works 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.6.7-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/EduSantosBrito/pagseguro-that-works#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/EduSantosBrito/pagseguro-that-works/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/EduSantosBrito/pagseguro-that-works/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/EduSantosBrito/pagseguro-that-works" />
  </a>
</p>

> Pagseguro API wrapper that actually works!

-   [Recurring Payment Flow](#recurring-payment-flow)
    -   [Recurring Payment Usage](#recurring-payment-usage)
        -   [Plan Creation](#plan-creation)
        -   [Log in to join a plan](#log-in-to-join-a-plan)
        -   [Plan adherence](#plan-adherence)
        -   [Billing plan](#billing-plan)
        -   [Retry payment](#retry-payment)
-   [Install](#install)
-   [Test](#test)

# [Homepage](https://github.com/EduSantosBrito/pagseguro-that-works#readme)

The main problem that I want to resolve with this package is that PagSeguro API packages are confusing and bad documented, so I've created this to include every payment method I need to use.

Feel free to contribute :)

# Install

```sh
yarn add pagseguro-that-works
```

# [Recurring Payment Flow](https://dev.pagseguro.uol.com.br/reference/api-recorrencia#recorrencia-introducao)

This feature will make this flow:

<img src="./recurring-payment-flow.png" width="600">

The basic flow is accomplished when these features are englobed:

| Description           | Developed | Tested |
| --------------------- | --------- | ------ |
| Plan creation         | Yes       | Yes    |
| Log in to join a plan | Yes       | Yes    |
| Plan adherence        | Yes       | Yes    |
| Billing plan          | Yes       | Yes    |
| Retry payment         | Yes       | Yes    |

The fully flow is accomplished when these features are englobed:

| Description               | Developed | Tested |
| ------------------------- | --------- | ------ |
| Plan creation             | Yes       | Yes    |
| Log in to join a plan     | Yes       | Yes    |
| Plan adherence            | Yes       | Yes    |
| Billing plan              | Yes       | Yes    |
| Suspend plan              | No        | No     |
| Reactivate plan           | No        | No     |
| Edit plan                 | No        | No     |
| Include coupon to payment | No        | No     |
| Change payment method     | No        | No     |
| Retry payment             | Yes       | Yes    |

## Recurring Payment Usage

### Plan Creation

> You need to create a request object based on type [`CreatePlanRequest`](https://github.com/EduSantosBrito/pagseguro-that-works/blob/4319dfd728522f97e08808e9690896b89fe10a59/src/types/CreatePlan.ts#L47), and pass with your Pagseguro Email, Pagseguro Token and NODE_ENV (development or production)

```ts
const finalDate = new Date();
finalDate.setMonth(finalDate.getMonth() + 1);
const request: CreatePlanRequest = {
    reference: 'SOME REFERENCE',
    preApproval: {
        name: 'PLAN NAME',
        charge: 'MANUAL',
        period: 'MONTHLY',
        amountPerPayment: 200.0,
        membershipFee: 15000.0,
        trialPeriodDuration: 28,
        finalDate,
    },
    maxUses: 500,
};
const createPlanResponse = await createPlan(pagseguroEmail, pagseguroToken, nodeEnv, request);
const [planId] = createPlanResponse.preApprovalRequest.code;
```

### Log in to join a plan

> You need to pass your Pagseguro Email, Pagseguro Token and NODE_ENV (development or production)

```ts
const sessionResponse = await getSession(pagseguroEmail, pagseguroToken, nodeEnv);
const sessionId = sessionResponse.session.id;
```

### Plan adherence

> You need to apss your Pagseguro Email, Pagseguro Token, NODE_ENV (development or production) and a request based on type [`AdherePlanRequest`](https://github.com/EduSantosBrito/pagseguro-that-works/blob/4319dfd728522f97e08808e9690896b89fe10a59/src/types/AdherePlan.ts#L54)

```ts
const request: AdherePlanRequest = {
    plan: 'PLAN ID, e.g. 659AB301DFDFE684448C1FB8B86F28F8',
    reference: 'SOME REFERENCE',
    paymentMethod: {
        type: 'CREDITCARD',
        creditCard: {
            token: 'CARD TOKEN GENERATED ON BROWSER',
            holder: {
                name: 'Nome Comprador',
                birthDate: '11/01/1984',
                documents: [
                    {
                        type: 'CPF',
                        value: '00000000191',
                    },
                ],
                billingAddress: {
                    street: 'Av. Brigadeiro Faria Lima',
                    number: '1384',
                    complement: '3 andar',
                    district: 'Jd. Paulistano',
                    city: 'São Paulo',
                    state: 'SP',
                    country: 'BRA',
                    postalCode: '01452002',
                },
                phone: {
                    areaCode: '11',
                    number: '988881234',
                },
            },
        },
    },
    sender: {
        email: 'test@sandbox.pagseguro.com.br',
        name: 'Sender Name',
        hash: 'SENDERHASH GENERATED ON BROWSER',
        address: {
            street: 'Av. Brigadeira Faria Lima',
            number: '1384',
            complement: '3 andar',
            district: 'Jd. Paulistano',
            city: 'São Paulo',
            state: 'SP',
            country: 'BRA',
            postalCode: '01452002',
        },
        documents: [
            {
                type: 'CPF',
                value: '00000000191',
            },
        ],
        phone: {
            areaCode: '11',
            number: '988881234',
        },
    },
};
const adherePlanResponse = await adherePlan(pagseguroEmail, pagseguroToken, nodeEnv, request);
const preApprovalCode = adherePlanResponse.code;
```

## Billing plan

> You need to pass your Pagseguro Email, Pagseguro Token, NODE_ENV (development or production), a request based on type [`BillingPlanRequest`](https://github.com/EduSantosBrito/pagseguro-that-works/blob/4319dfd728522f97e08808e9690896b89fe10a59/src/types/BillingPlan.ts#L10), the preApprovalCode (result from plan adherence))

> PS: You can only bill a plan that `charge` is MANUAL

```ts
const request: BillingPlanRequest = {
    preApprovalCode: preApprovalCode as string,
    items: [{ id: '0001', description: 'teste1', amount: '200.00', quantity: '1' }],
};

const billingPlanResponse = await billingPlan(email as string, token as string, 'development', request);
```

## Retry payment

> You need to pass your Pagseguro Email, Pagseguro Token, NODE_ENV (development or production), a request based on type [`RetryPaymentRequest`](https://github.com/EduSantosBrito/pagseguro-that-works/blob/4319dfd728522f97e08808e9690896b89fe10a59/src/types/RetryPayment.ts#L3), the preApprovalCode (result from plan adherence) and the paymentOrderCode (you can see how to get this [here](https://github.com/EduSantosBrito/pagseguro-that-works/blob/4319dfd728522f97e08808e9690896b89fe10a59/src/__tests__/recurring-payment.test.ts#L142))

> PS: You can only bill a plan that `charge` is AUTO

```ts
const request: RetryPaymentRequest = {
    type: 'CREDITCARD',
    sender: {
        hash: 'SENDERHASH GENERATED ON BROWSER',
    },
    creditCard: {
        token: 'CARD TOKEN GENERATED ON BROWSER',
        holder: {
            name: 'Nome Comprador',
            birthDate: '11/01/1984',
            documents: [
                {
                    type: 'CPF',
                    value: '00000000191',
                },
            ],
            billingAddress: {
                street: 'Av. Brigadeiro Faria Lima',
                number: '1384',
                complement: '3 andar',
                district: 'Jd. Paulistano',
                city: 'São Paulo',
                state: 'SP',
                country: 'BRA',
                postalCode: '01452002',
            },
            phone: {
                areaCode: '11',
                number: '988881234',
            },
        },
    },
};
const retryPaymentResponse = await retryPayment(pagseguroEmail, pagseguroToken, nodeEnv, request, preApprovalCode, paymentOrderCode);
const { transactionCode } = retryPaymentResponse;
```

# Test

> PS: You need to create a project running with PagSeguroDirectPayment at port 3000. If you want to clone something already developed, clone this repo: [pagseguro-hash-generator](https://github.com/EduSantosBrito/pagseguro-hash-generator)

> PS2: Create a .env based on .env.example

```sh
yarn test
```

# Author

👤 **Eduardo Santos Brito**

-   Website: https://portfolio.brito.top
-   Github: [@EduSantosBrito](https://github.com/EduSantosBrito)

# 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/EduSantosBrito/pagseguro-that-works/issues).

# Show your support

Give a ⭐️ if this project helped you!

# 📝 License

Copyright © 2021 [Eduardo Santos Brito](https://github.com/EduSantosBrito).<br />
This project is [MIT](https://github.com/EduSantosBrito/pagseguro-that-works/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
