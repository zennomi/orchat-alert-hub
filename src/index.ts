import * as dotenv from "dotenv";
dotenv.config();

import { TelegramBot } from "./telegram";
import CronJob from "./tasks/cron-job";
import EventListener from "./tasks/event-listener";

async function main() {
    TelegramBot.launchBot().then(() => {
        console.log("Bot is working...");
        CronJob.start().then(() => {
            console.log("Cron Job is running...");
        });
        EventListener.start().then(() => {
            console.log("Listening cosmos event...");
        });
    });
}

try {
    main().then(() => {});
} catch (err) {
    console.log(err);
}
