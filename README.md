<h1 align="center">Welcome to pagseguro-that-works 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
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

### 🏠 [Homepage](https://github.com/EduSantosBrito/pagseguro-that-works#readme)

The main problem that I want to resolve with this package is that PagSeguro API packages are confusing and bad documented, so I've created this to include every payment method I need to use.

Feel free to contribute :)

### 🔂 [Recurring Payment Flow](https://dev.pagseguro.uol.com.br/reference/api-recorrencia#recorrencia-introducao)

This feature will make this flow:

<img src="./recurring-payment-flow.png" width="600">

The basic flow is accomplished when these features are englobed:

| Description           | Developed | Tested |
| --------------------- | --------- | ------ |
| Plan creation         | Yes       | No     |
| Log in to join a plan | No        | No     |
| Plan adherence        | No        | No     |
| Billing plan          | No        | No     |
| Retry payment         | No        | No     |

The fully flow is accomplished when these features are englobed:

| Description               | Developed | Tested |
| ------------------------- | --------- | ------ |
| Plan creation             | No        | No     |
| Log in to join a plan     | No        | No     |
| Plan adherence            | No        | No     |
| Billing plan              | No        | No     |
| Suspend plan              | No        | No     |
| Reactivate plan           | No        | No     |
| Edit plan                 | No        | No     |
| Include coupon to payment | No        | No     |
| Change payment method     | No        | No     |
| Retry payment             | No        | No     |

## Install

```sh
yarn add pagseguro-that-works
```

## Author

👤 **Eduardo Santos Brito**

-   Website: https://portfolio.brito.top
-   Github: [@EduSantosBrito](https://github.com/EduSantosBrito)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/EduSantosBrito/pagseguro-that-works/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Eduardo Santos Brito](https://github.com/EduSantosBrito).<br />
This project is [MIT](https://github.com/EduSantosBrito/pagseguro-that-works/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
