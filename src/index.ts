import * as dotenv from "dotenv";
dotenv.config();

import sha256 from "sha256";

import { TelegramBot } from "./telegram";
import CronJob from "./tasks/cron-job";
import EventListener from "./tasks/event-listener";
import CoinMarketCap from "./market/coin-market-cap";
import CosmWasm from "./cosmwasm";
import OrchaiLending from "./cosmwasm/orchai-lending";

async function main() {
    TelegramBot.launchBot();
    CronJob.start();
    EventListener.start();
}

try {
    main().then(() => {});
} catch (err) {
    console.log(err);
}
