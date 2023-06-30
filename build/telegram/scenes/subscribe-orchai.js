"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOrchaiCapacityThresholdScene = exports.setOrchaiWalletAddressScene = void 0;
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const sha256_1 = __importDefault(require("sha256"));
const constants_1 = require("../../constants");
const event_repository_1 = __importDefault(require("../../repository/event-repository"));
const cosmwasm_1 = __importDefault(require("../../cosmwasm"));
const message_creation_1 = __importDefault(require("../message-creation"));
const setOrchaiWalletAddressScene = new telegraf_1.Scenes.BaseScene("set_orchai_wallet_address");
exports.setOrchaiWalletAddressScene = setOrchaiWalletAddressScene;
setOrchaiWalletAddressScene.enter(async (ctx) => {
    ctx.answerCbQuery("Send me the wallet address you want to receive information");
    let chatId = ctx.chat?.id.toString();
    let eventType = constants_1.EVENT_TYPE.ORCHAI;
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
                ` Send me your new wallet address you want to receive information (type exit to discard change).`;
    }
    ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(replyText));
});
setOrchaiWalletAddressScene.leave((ctx) => {
    // ctx.reply("leave scene");
});
setOrchaiWalletAddressScene.on((0, filters_1.message)("text"), async (ctx) => {
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
            let eventType = constants_1.EVENT_TYPE.ORCHAI;
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
setOrchaiWalletAddressScene.on("callback_query", (ctx) => {
    ctx.answerCbQuery();
});
const setOrchaiCapacityThresholdScene = new telegraf_1.Scenes.BaseScene("set_orchai_capacity_threshold");
exports.setOrchaiCapacityThresholdScene = setOrchaiCapacityThresholdScene;
setOrchaiCapacityThresholdScene.enter(async (ctx) => {
    let chatId = ctx.chat?.id.toString();
    let eventType = constants_1.EVENT_TYPE.ORCHAI;
    let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
    let event = await event_repository_1.default.findByEventId(eventId);
    let walletAddress = event?.params?.get("walletAddress");
    let walletCapacityThreshold = Number(event?.params?.get("capacityThreshold") || "0");
    let replyCbQuery = "";
    let replyText = "";
    if (!walletAddress) {
        replyCbQuery =
            "You have not set up a wallet address. Please setup wallet address before.";
        replyText =
            "You have not set up a wallet address. Please setup wallet address before.";
        ctx.scene.leave();
    }
    else {
        replyCbQuery = "Send me capacity threshold value";
        replyText =
            "Your current capacity threshold value is " +
                walletCapacityThreshold +
                ".\n" +
                "Capacity threshold value between 1 and 100, send me capacity threshold value (type exit to discard change).";
    }
    ctx.answerCbQuery(replyCbQuery);
    ctx.reply(replyText);
});
setOrchaiCapacityThresholdScene.leave((ctx) => {
    // ctx.reply("leave scene");
});
setOrchaiCapacityThresholdScene.on((0, filters_1.message)("text"), async (ctx) => {
    let message = ctx.message;
    let capacityThreshold = 0;
    try {
        if (message["text"].toLowerCase() == "exit") {
            ctx.reply("Your settings remain unchanged");
        }
        else {
            capacityThreshold = Number(message["text"]);
            if (capacityThreshold < 1 ||
                capacityThreshold > 100 ||
                Number.isNaN(capacityThreshold)) {
                throw new Error("Invalid capacity threshold");
            }
            let chatId = ctx.chat?.id.toString();
            let eventType = constants_1.EVENT_TYPE.ORCHAI;
            let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
            let event = await event_repository_1.default.findByEventId(eventId);
            event?.params?.set("capacityThreshold", capacityThreshold.toString());
            await event?.save();
            ctx.reply("You have set capacity threshold value to " + capacityThreshold);
        }
    }
    catch (err) {
        ctx.reply("You have entered invalid value");
    }
    ctx.scene.leave();
});
setOrchaiCapacityThresholdScene.on("callback_query", (ctx) => {
    ctx.answerCbQuery();
});
