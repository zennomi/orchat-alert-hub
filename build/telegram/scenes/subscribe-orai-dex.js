"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOraiDEXWalletAddressScene = void 0;
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const sha256_1 = __importDefault(require("sha256"));
const constants_1 = require("../../constants");
const event_repository_1 = __importDefault(require("../../repository/event-repository"));
const cosmwasm_1 = __importDefault(require("../../cosmwasm"));
const message_creation_1 = __importDefault(require("../message-creation"));
const setOraiDEXWalletAddressScene = new telegraf_1.Scenes.BaseScene("set_orai_dex_wallet_address");
exports.setOraiDEXWalletAddressScene = setOraiDEXWalletAddressScene;
setOraiDEXWalletAddressScene.enter(async (ctx) => {
    let chatId = ctx.chat?.id.toString();
    let eventType = constants_1.EVENT_TYPE.ORAI_DEX;
    let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
    let event = await event_repository_1.default.findByEventId(eventId);
    let walletAddress = event?.params?.get("walletAddress");
    let replyText = "";
    if (!walletAddress) {
        replyText =
            "You have not set up a wallet address.\n" +
                "Send me the wallet address you want to receive information (type exit to discard change).";
    }
    else {
        replyText =
            `Your current wallet address is \`${walletAddress}\`.\n` +
                `Send me your new wallet address you want to receive information (type exit to discard change).`;
    }
    ctx.answerCbQuery("Send me the wallet address you want to receive notification");
    ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(replyText));
});
setOraiDEXWalletAddressScene.leave((ctx) => {
    // ctx.reply("leave scene");
});
setOraiDEXWalletAddressScene.on((0, filters_1.message)("text"), async (ctx) => {
    let message = ctx.message;
    let text = message["text"];
    if (text.toLowerCase() == "exit") {
        ctx.reply("Your settings remain unchanged");
    }
    else {
        let client = await cosmwasm_1.default.getCosmWasmClient();
        let account = await cosmwasm_1.default.queryAccount(client, text);
        if (account) {
            let chatId = ctx.chat?.id.toString();
            let eventType = constants_1.EVENT_TYPE.ORAI_DEX;
            let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
            let event = await event_repository_1.default.findByEventId(eventId);
            event?.params?.set("walletAddress", account.address);
            await event?.save();
            ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(`You have successfully set your wallet address to \`${account.address}\``));
        }
        else {
            ctx.reply("You have sent me invalid address");
        }
    }
    ctx.scene.leave();
});
setOraiDEXWalletAddressScene.on("callback_query", (ctx) => {
    ctx.answerCbQuery();
});
