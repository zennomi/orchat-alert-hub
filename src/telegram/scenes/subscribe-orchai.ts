import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import sha256 from "sha256";
import { EVENT_TYPE } from "../../constants";
import EventRepository from "../../repository/event-repository";
import CosmWasm from "../../cosmwasm";

const setOrchaiWalletAddressScene = new Scenes.BaseScene(
    "set_orchai_wallet_address"
);

setOrchaiWalletAddressScene.enter(async (ctx) => {
    let chatId = ctx.chat?.id.toString() as string;
    let eventType = EVENT_TYPE.ORCHAI;
    let eventId = sha256(eventType + "_" + chatId);
    let event = await EventRepository.findByEventId(eventId);
    let walletAddress = event?.params?.get("walletAddress");
    let replyText = "";
    if (!walletAddress) {
        replyText =
            "You have not set up a wallet address. Send me the wallet address you want to receive notification";
    } else {
        replyText =
            "Your current wallet address is " +
            walletAddress +
            ". Send me your new wallet address you want to receive notification";
    }
    ctx.answerCbQuery(
        "Send me the wallet address you want to receive notification"
    );
    ctx.reply(replyText);
});

setOrchaiWalletAddressScene.leave((ctx) => {
    // ctx.reply("leave scene");
});

setOrchaiWalletAddressScene.on(message("text"), async (ctx) => {
    let message = ctx.message;
    let text = (message as any)["text"];
    let client = await CosmWasm.getCosmWasmClient();
    let account = await CosmWasm.queryAccount(client, text);
    if (account) {
        let chatId = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        event?.params?.set("walletAddress", account.address);
        await event?.save();
        ctx.reply("You have just set wallet address to " + account.address);
    } else {
        ctx.reply("You have sent me invalid address");
    }
    (ctx as any).scene.leave();
});

setOrchaiWalletAddressScene.on("callback_query", (ctx) => {
    ctx.answerCbQuery();
});

const setOrchaiCapacityThresholdScene = new Scenes.BaseScene(
    "set_orchai_capacity_threshold"
);
setOrchaiCapacityThresholdScene.enter(async (ctx) => {
    let chatId = ctx.chat?.id.toString() as string;
    let eventType = EVENT_TYPE.ORCHAI;
    let eventId = sha256(eventType + "_" + chatId);
    let event = await EventRepository.findByEventId(eventId);
    let walletAddress = event?.params?.get("walletAddress");
    let walletCapacityThreshold = event?.params?.get("capacityThreshold") || 0;
    let replyCbQuery = "";
    let replyText = "";
    if (!walletAddress) {
        replyCbQuery =
            "You have not set up a wallet address. Please setup wallet address before";
        replyText =
            "You have not set up a wallet address. Please setup wallet address before";
        (ctx as any).scene.leave();
    } else {
        replyCbQuery = "Send me capacity threshold value";
        replyText =
            "Your current borrower address is " +
            walletAddress +
            " and current capacity threshold value is " +
            walletCapacityThreshold +
            ". Capacity threshold value between 1 and 100, send me capacity threshold value";
    }
    ctx.answerCbQuery(replyCbQuery);
    ctx.reply(replyText);
});

setOrchaiCapacityThresholdScene.leave((ctx) => {
    // ctx.reply("leave scene");
});

setOrchaiCapacityThresholdScene.on(message("text"), async (ctx) => {
    let message = ctx.message;
    let capacityThreshold = 0;
    try {
        capacityThreshold = Number((message as any)["text"]);
        if (
            capacityThreshold < 1 ||
            capacityThreshold > 100 ||
            Number.isNaN(capacityThreshold)
        ) {
            throw new Error("Invalid capacity threshold");
        }
        let chatId = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        event?.params?.set("capacityThreshold", capacityThreshold.toString());
        await event?.save();
        ctx.reply(
            "You have set capacity threshold value to " + capacityThreshold
        );
    } catch (err) {
        ctx.reply("You have entered invalid value");
    }
    (ctx as any).scene.leave();
});

setOrchaiCapacityThresholdScene.on("callback_query", (ctx) => {
    ctx.answerCbQuery();
});

export { setOrchaiWalletAddressScene, setOrchaiCapacityThresholdScene };
