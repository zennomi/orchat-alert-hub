import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import sha256 from "sha256";
import { EVENT_TYPE } from "../../constants";
import EventRepository from "../../repository/event-repository";
import CosmWasm from "../../cosmwasm";

const setOraiDEXWalletAddressScene = new Scenes.BaseScene(
    "set_orai_dex_wallet_address"
);

setOraiDEXWalletAddressScene.enter(async (ctx) => {
    let chatId = ctx.chat?.id.toString() as string;
    let eventType = EVENT_TYPE.ORAI_DEX;
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

setOraiDEXWalletAddressScene.leave((ctx) => {
    // ctx.reply("leave scene");
});

setOraiDEXWalletAddressScene.on(message("text"), async (ctx) => {
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

setOraiDEXWalletAddressScene.on("callback_query", (ctx) => {
    ctx.answerCbQuery();
});

export { setOraiDEXWalletAddressScene };
