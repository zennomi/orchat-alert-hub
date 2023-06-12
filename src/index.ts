import * as dotenv from "dotenv";
dotenv.config();

import sha256 from "sha256";

import { TelegramBot } from "./telegram";
import CronJob from "./tasks/cron-job";
import EventListener from "./tasks/event-listener";


async function main() {
    TelegramBot.launchBot();
    CronJob.start();
    EventListener.start();
}

main().then(() => {});
