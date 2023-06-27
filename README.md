# GUIDELINE

## Installation and usage

### Run local

Install dependencies

```shell
yarn
```

To run in development mode

```shell
yarn dev
```

To run in production mode

```shell
yarn build
yarn start
```

### Run on docker

Build docker image defined in Dockerfile

```shell
docker image build ./
```

After build, run docker image to run bot

```shell
docker run <image-id>
```

## Project structures explanation

### cosmwasm

This directory define module to interact with cosmwasm contract by using library [cosmwasm](https://www.npmjs.com/package/cosmwasm).

In `index.ts` define function `getCosmwasmClient()` to get `client` object used for interacting with the contract.
`orai-oracle.ts`, `oraidex.ts`,... are modules to interact with corresponding contract `Orai Oracle`, `Oraidex`.

### market

This directory defines modules to query API of coingecko and coinmarketcap to get market information.

### model

This directory defines collections in database mongo.

- `user`: while telegram user uses our bot, user information will be created in this collection. User is unique by their chatId.
- `event`: store events user subscribed as well as their setting params to alert them correctly.
  - events is unique by `eventId`. `eventId` is created by `sha256(eventType, chatId)`. In that, `eventType` currently has `event_type_orai_dex` and `event_type_orchai` . `chatId` corresponds to the subscribed user
  - `notificationStatus` indicates whether to notify them of the event when the event occurs.
  - `params` is setting params of user. For example, with `event_type_orai_dex`, has only one param is `walletAddress`, which address they want to receive orderbook notification. And with `event_type_orchai` is `walletAddress` and `capacityThreshold`
- `market-data`: store data to serve when user ask bot. Include `data` is raw data we query from coingecko, coinmarketcap,... And `photo` is chart was drawn by library [chartjs-node-canvas](https://www.npmjs.com/package/chartjs-node-canvas).
- `token`: store token data, only includes data about tokens supported by our bot.

All `market-data`, `token` are scheduled for periodic updates using cron job.

### repository

This directory defines modules to interact with database mongo. As well as functions to create, update, query collection in database.

### tasks

This directory defines modules `cron-job` and `event-listener`.

- `cron-job`: This module perform periodic tasks such as query and update `market-data`, `token`. As well as query that checks if the conditions under which the user set the `event` occur to notify them.
- `event-listener`: Listen event on `oraichain` to notify user when they execute oraidex orderbook order, or when they change their position in orchai lending pool (includes when they are liquidated). In currently version, we implement listen actions like `withdrawCollaterals` or `borrow` to know if the user's position has changed to the `threshold` they set to receive notifications.

### telegram

This directory defines modules to handle telegram bot actions. Need to understand library [telegraf](https://www.npmjs.com/package/telegraf) to handle telegram bot actions.

- `index.ts`: Init telegram bot by `BOT_TOKEN`. Defining bot actions in response to user interaction.
- `message.ts`: define messages for inline button in response to user.
- `message-creation.ts`: define functions for receive data input such as market information, borrower information,... and create message to send to user.
- `scenes`: define `Scene`, need to understand `telegraf` to understand what is `Scene`.

## Project config params

Config params were defined in `.env` and `constants.ts`.

In `constants.ts`:

- `CronTime`: define cron time string for cron job.
- `CMCMappingID`: mapping token to its id for query data in coinmarketcap
- `CGMappingID`: mapping token to its id for query data in coingecko
- `SUPPORTED_TOKEN`: list supported token in our bot.
