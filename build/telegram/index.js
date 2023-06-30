"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBot = void 0;
const axios_1 = __importDefault(require("axios"));
const telegraf_1 = require("telegraf");
const sha256_1 = __importDefault(require("sha256"));
const table_1 = require("table");
const cosmwasm_1 = __importDefault(require("../cosmwasm"));
const user_repository_1 = __importDefault(require("../repository/user-repository"));
const orchai_lending_1 = __importDefault(require("../cosmwasm/orchai-lending"));
const message_creation_1 = __importDefault(require("./message-creation"));
const constants_1 = require("../constants");
const event_repository_1 = __importDefault(require("../repository/event-repository"));
const index_1 = require("./scenes/index");
const market_data_repository_1 = __importDefault(require("../repository/market-data-repository"));
const message_1 = __importDefault(require("./message"));
const token_repository_1 = __importDefault(require("../repository/token-repository"));
const cron_job_1 = require("../tasks/cron-job");
const utils_1 = __importDefault(require("../utils"));
const { BOT_TOKEN } = process.env;
var cosmwasmClient;
var TelegramBot;
(function (TelegramBot) {
    const bot = new telegraf_1.Telegraf(BOT_TOKEN);
    const stage = new telegraf_1.Scenes.Stage([
        index_1.setOrchaiWalletAddressScene,
        index_1.setOrchaiCapacityThresholdScene,
        index_1.setOraiDEXWalletAddressScene,
    ]);
    bot.use((0, telegraf_1.session)());
    bot.use(stage.middleware());
    // anti bot middleware
    bot.use((ctx, next) => {
        let message = ctx.message;
        if (!ctx.from?.is_bot) {
            return next();
        }
        else {
            ctx.reply("You are bot!!!");
        }
    });
    bot.start(async (ctx) => {
        let message = message_1.default.hello();
        ctx.replyWithMarkdownV2(message.text, {
            reply_markup: message.replyMarkup,
        });
        let chatId = ctx.chat.id;
        let userInfo = ctx.from;
        let user = await user_repository_1.default.findByChatId(chatId);
        if (!user) {
            await user_repository_1.default.createUser(chatId, userInfo.id, userInfo.first_name, userInfo.last_name, userInfo.username, userInfo.language_code);
        }
    });
    bot.action("getting_information", async (ctx) => {
        let message = message_1.default.gettingInformation();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_token_info", async (ctx) => {
        let message = message_1.default.getTokenInfo();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_token_info_back", async (ctx) => {
        let message = message_1.default.gettingInformation();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_orchai_money_market_info", async (ctx) => {
        ctx.reply("Please wait for a moment.");
        let message = message_1.default.getOrchaiMoneyMarketInfo();
        let chatId = ctx.chat?.id.toString();
        let eventType = constants_1.EVENT_TYPE.ORCHAI;
        let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
        let event = await event_repository_1.default.findByEventId(eventId);
        if (!event) {
            event_repository_1.default.create(eventId, chatId, eventType, {});
        }
        event = await event_repository_1.default.findByEventId(eventId);
        let walletAddress = event?.params?.get("walletAddress");
        let messageText = cron_job_1.moneyMarketInfo.message;
        if (walletAddress) {
            let borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, walletAddress);
            let netAPY = (borrowerInfo.totalLend * cron_job_1.moneyMarketInfo.lendAPY -
                borrowerInfo.loanAmount * cron_job_1.moneyMarketInfo.borrowAPY) /
                (borrowerInfo.totalLend + borrowerInfo.loanAmount) || 0;
            messageText += message_creation_1.default.borrowerInfo(walletAddress, borrowerInfo, netAPY.toFixed(2));
            messageText += "\n" + "You can type /orchaimm for fast information";
        }
        else {
            messageText +=
                "Setting your wallet address to see your profile at Orchai Money Market";
        }
        try {
            await ctx.editMessageText(messageText, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_orchai_money_market_info_refresh", async (ctx) => {
        ctx.reply("Please wait for a moment.");
        let message = message_1.default.getOrchaiMoneyMarketInfo();
        let chatId = ctx.chat?.id.toString();
        let eventType = constants_1.EVENT_TYPE.ORCHAI;
        let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
        let event = await event_repository_1.default.findByEventId(eventId);
        if (!event) {
            event_repository_1.default.create(eventId, chatId, eventType, {});
        }
        event = await event_repository_1.default.findByEventId(eventId);
        let walletAddress = event?.params?.get("walletAddress");
        let messageText = cron_job_1.moneyMarketInfo.message;
        if (walletAddress) {
            let borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, walletAddress);
            let netAPY = (borrowerInfo.totalLend * cron_job_1.moneyMarketInfo.lendAPY -
                borrowerInfo.loanAmount * cron_job_1.moneyMarketInfo.borrowAPY) /
                (borrowerInfo.totalLend + borrowerInfo.loanAmount) || 0;
            messageText += message_creation_1.default.borrowerInfo(walletAddress, borrowerInfo, netAPY.toFixed(2));
            messageText += "\n" + "You can type /orchaimm for fast information";
        }
        else {
            messageText +=
                "Setting your wallet address to see your profile at Orchai Money Market";
        }
        try {
            await ctx.replyWithMarkdownV2(messageText);
            ctx.answerCbQuery("");
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_orchai_money_market_info_set_wallet_address", telegraf_1.Scenes.Stage.enter("set_orchai_wallet_address"));
    bot.action("get_orchai_money_market_info_back", async (ctx) => {
        let message = message_1.default.gettingInformation();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_lending_apy_across_protocols", async (ctx) => {
        let message = message_1.default.getLendingAPYAcrossProtocols();
        let data = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.OTHER_PROTOCOLS_APY);
        let messageText = `APY for Lending USDT Across Protocols\n` +
            `*Orchai Money Market* (On Oraichain): ${data?.data["orchaiDepositAPY"]}%\n` +
            `*AaveV2* (On Ethereum): ${data?.data["aaveDepositAPY"]}%\n` +
            `*Venus* (On Binance Smart Chain): ${data?.data["venusDepositAPY"]}%\n` +
            `You can type /lendingapy for fast information\n`;
        try {
            await ctx.editMessageText(message_creation_1.default.escapeMessage(messageText), {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_lending_apy_across_protocols_back", async (ctx) => {
        let message = message_1.default.gettingInformation();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_users_eligible_for_liquidation", async (ctx) => {
        let message = message_1.default.getUsersEligibleForLiquidation();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_users_eligible_for_liquidation_aave", async (ctx) => {
        try {
            let marketData = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.OTHER_PROTOCOLS_LIQUIDATION_LIST + "_aave");
            let data = marketData?.data.splice(0, 200);
            let message = getPaginatedLiquidationList(data, 1, "ll_aave");
            ctx.replyWithMarkdownV2(message.text, {
                reply_markup: message.replyMarkup,
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_users_eligible_for_liquidation_venus", async (ctx) => {
        try {
            let marketData = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.OTHER_PROTOCOLS_LIQUIDATION_LIST + "_venus");
            let data = marketData?.data.splice(0, 200);
            let message = getPaginatedLiquidationList(data, 1, "ll_venus");
            ctx.replyWithMarkdownV2(message.text, {
                reply_markup: message.replyMarkup,
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("get_users_eligible_for_liquidation_back", async (ctx) => {
        let message = message_1.default.gettingInformation();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("getting_information_back", async (ctx) => {
        let message = message_1.default.hello();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert", async (ctx) => {
        let message = message_1.default.settingAlert();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert_orchai", async (ctx) => {
        let chatId = ctx.chat?.id.toString();
        let eventType = constants_1.EVENT_TYPE.ORCHAI;
        let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
        let event = await event_repository_1.default.findByEventId(eventId);
        let notificationStatus = false;
        if (!event) {
            event_repository_1.default.create(eventId, chatId, eventType, {});
        }
        else {
            notificationStatus = event.notificationStatus;
        }
        event = await event_repository_1.default.findByEventId(eventId);
        let walletAddress = event?.params?.get("walletAddress") || "";
        let capacityThreshold = Number(event?.params?.get("capacityThreshold") || "0").toString();
        let message = message_1.default.settingAlertOrchai(walletAddress, capacityThreshold, notificationStatus);
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert_orchai_wallet_address", telegraf_1.Scenes.Stage.enter("set_orchai_wallet_address"));
    bot.action("setting_alert_orchai_capacity_threshold", telegraf_1.Scenes.Stage.enter("set_orchai_capacity_threshold"));
    bot.action("setting_alert_orchai_toggle_notification_status", async (ctx) => {
        let chatId = ctx.chat?.id.toString();
        let eventType = constants_1.EVENT_TYPE.ORCHAI;
        let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
        let event = await event_repository_1.default.findByEventId(eventId);
        let notificationStatus = !event?.notificationStatus;
        await event_repository_1.default.updateNotificationStatus(eventId, notificationStatus);
        let message = message_1.default.settingAlertOrchai(event?.params?.get("walletAddress") || "", Number(event?.params?.get("capacityThreshold") || "0").toString(), notificationStatus);
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert_orchai_back", async (ctx) => {
        let message = message_1.default.settingAlert();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert_orai_dex", async (ctx) => {
        let chatId = ctx.chat?.id.toString();
        let eventType = constants_1.EVENT_TYPE.ORAI_DEX;
        let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
        let event = await event_repository_1.default.findByEventId(eventId);
        let notificationStatus = false;
        if (!event) {
            event_repository_1.default.create(eventId, chatId, eventType, {});
        }
        else {
            notificationStatus = event.notificationStatus;
        }
        event = await event_repository_1.default.findByEventId(eventId);
        let walletAddress = event?.params?.get("walletAddress") || "";
        let message = message_1.default.settingAlertOraiDEX(walletAddress, notificationStatus);
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert_orai_dex_wallet_address", telegraf_1.Scenes.Stage.enter("set_orai_dex_wallet_address"));
    bot.action("setting_alert_orai_dex_toggle_notification_status", async (ctx) => {
        let chatId = ctx.chat?.id.toString();
        let eventType = constants_1.EVENT_TYPE.ORAI_DEX;
        let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
        let event = await event_repository_1.default.findByEventId(eventId);
        let notificationStatus = !event?.notificationStatus;
        await event_repository_1.default.updateNotificationStatus(eventId, notificationStatus);
        let message = message_1.default.settingAlertOraiDEX(event?.params?.get("walletAddress") || "", notificationStatus);
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert_orai_dex_back", async (ctx) => {
        let message = message_1.default.settingAlert();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.action("setting_alert_back", async (ctx) => {
        let message = message_1.default.hello();
        try {
            await ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            ctx.answerCbQuery("");
        }
    });
    bot.command("p", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        }
        else {
            let tokenStr = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(constants_1.SUPPORTED_TOKEN);
            if (listSupportedToken.includes(tokenStr)) {
                let tokenDenom = constants_1.SUPPORTED_TOKEN[tokenStr];
                let token = await token_repository_1.default.findByDenom(tokenDenom);
                let message = `Token: *${tokenStr}*\n` +
                    `Price: ${utils_1.default.stringifyNumberToUSD(token?.price)}\n` +
                    `1h change: ${token?.percentageChange1h}%\n` +
                    `24h change: ${token?.percentageChange24h}%`;
                ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(message));
            }
            else {
                ctx.reply("We do not support this token");
            }
        }
    });
    bot.command("c", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        }
        else {
            let tokenStr = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(constants_1.SUPPORTED_TOKEN);
            if (listSupportedToken.includes(tokenStr)) {
                let dataType = constants_1.MARKET_DATA_TYPE.TOKEN + "_" + constants_1.SUPPORTED_TOKEN[tokenStr];
                let data = await market_data_repository_1.default.findByType(dataType);
                if (data?.photo) {
                    let photo = data.photo[0].buffer;
                    ctx.replyWithPhoto({ source: photo });
                }
            }
            else {
                ctx.reply("We do not support this token");
            }
        }
    });
    bot.command("cm", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        }
        else {
            let tokenStr = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(constants_1.SUPPORTED_TOKEN);
            if (listSupportedToken.includes(tokenStr)) {
                let dataType = constants_1.MARKET_DATA_TYPE.TOKEN + "_" + constants_1.SUPPORTED_TOKEN[tokenStr];
                let data = await market_data_repository_1.default.findByType(dataType);
                let tokenDenom = constants_1.SUPPORTED_TOKEN[tokenStr];
                let token = await token_repository_1.default.findByDenom(tokenDenom);
                let message = `Token: *${tokenStr}*\n` +
                    `Market cap: ${utils_1.default.stringifyNumberToUSD(token?.marketCap)}\n` +
                    `24h Volume: ${utils_1.default.stringifyNumberToUSD(token?.volume24h)}\n` +
                    `24h Volume change: ${token?.volumeChange24h}%`;
                ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(message));
                if (data?.photo) {
                    let photo = data.photo[1].buffer;
                    ctx.replyWithPhoto({ source: photo });
                }
            }
            else {
                ctx.reply("We do not support this token");
            }
        }
    });
    bot.command("calc", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 3) {
            ctx.reply("Invalid value");
        }
        else {
            try {
                let tokenStr = tmp[1].toUpperCase();
                let number = Number(tmp[2]);
                if (number < 0 || Number.isNaN(number)) {
                    throw Error();
                }
                let listSupportedToken = Object.keys(constants_1.SUPPORTED_TOKEN);
                if (listSupportedToken.includes(tokenStr)) {
                    let dataType = constants_1.MARKET_DATA_TYPE.TOKEN +
                        "_" +
                        constants_1.SUPPORTED_TOKEN[tokenStr];
                    let data = await market_data_repository_1.default.findByType(dataType);
                    let tokenDenom = constants_1.SUPPORTED_TOKEN[tokenStr];
                    let token = await token_repository_1.default.findByDenom(tokenDenom);
                    let btc = await token_repository_1.default.findByDenom("btc");
                    let eth = await token_repository_1.default.findByDenom("eth");
                    let usdResult = number * Number(token?.price);
                    let btcResult = usdResult / Number(btc?.price);
                    let ethResult = usdResult / Number(eth?.price);
                    let message = `Calculating ${tokenStr} ${number} \n` +
                        `${tokenStr} current price: ${utils_1.default.stringifyNumberToUSD(token?.price)}\n` +
                        `=> ${utils_1.default.stringifyNumber(usdResult)} USD\n` +
                        `=> ${utils_1.default.stringifyNumber(btcResult)} BTC\n` +
                        `=> ${utils_1.default.stringifyNumber(ethResult)} ETH\n`;
                    ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(message));
                }
                else {
                    ctx.reply("We do not support this token");
                }
            }
            catch (err) {
                ctx.reply("Invalid value");
            }
        }
    });
    bot.command("top", async (ctx) => {
        let result = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.TOP_10_MARKET_CAP);
        let data = result?.data;
        let dataTable = [];
        dataTable.push(["#", "Coin", "Price", "Price 24h%"]);
        for (let i = 0; i < data.length; i++) {
            dataTable.push([
                i + 1,
                data[i].symbol.toUpperCase(),
                utils_1.default.stringifyNumberToUSD(data[i].price),
                Number(data[i].priceChangePercentage).toFixed(2) + "%",
            ]);
        }
        let message = "```\n" +
            (0, table_1.table)(dataTable, {
                drawHorizontalLine: () => false,
                drawVerticalLine: () => false,
            }) +
            "```";
        ctx.replyWithMarkdownV2(message);
        if (result?.photo) {
            let photo = result.photo[0].buffer;
            ctx.replyWithPhoto({ source: photo });
        }
    });
    bot.command("supportedtoken", async (ctx) => {
        let listSupportedToken = Object.keys(constants_1.SUPPORTED_TOKEN);
        let tokens = "";
        for (let i = 0; i < listSupportedToken.length; i++) {
            tokens += `*${listSupportedToken[i]}*`;
            if (i != listSupportedToken.length - 1) {
                tokens += ", ";
            }
            else {
                tokens += ".";
            }
        }
        let message = "Currently we support: " + tokens;
        ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(message));
    });
    bot.command("meme", async (ctx) => {
        ctx.reply("Please wait for a moment.!!");
        try {
            let memeResponse = await axios_1.default.get(constants_1.memeAPI);
            if (memeResponse.status == 200) {
                let memeUrl = memeResponse.data.url;
                memeResponse = await axios_1.default.get(memeUrl);
                if (Number(memeResponse.data.length) > 4194304) {
                    throw Error();
                }
                ctx.replyWithPhoto({ url: memeUrl });
            }
            else {
                throw Error();
            }
        }
        catch (err) {
            let messagePool = [
                "Aw, it looks like I haven't come up with a meme just yet. No worries, though! I'll keep trying to find something funny for you.",
                "No memes available at the moment, but I'm working on it!",
                "Looks like my meme generator is taking a little break. It seems I haven't come up with any memes just yet. Don't worry, though! I'll keep trying to find the perfect one for you.",
                "No memes yet, but I'm on it!",
            ];
            let random = Math.floor(Math.random() * 1000) % messagePool.length;
            ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(messagePool[random]));
            // console.log(err);
        }
    });
    bot.command("quote", async (ctx) => {
        ctx.reply("Please wait for a moment.!!");
        try {
            let quoteResponse = await axios_1.default.get(constants_1.quoteAPI);
            if (quoteResponse.status == 200) {
                let content = quoteResponse.data.content;
                let author = quoteResponse.data.author;
                let message = `"${content}" - ${author}`;
                ctx.reply(message);
            }
            else {
                throw Error();
            }
        }
        catch (err) {
            ctx.reply("I haven't come up with any quotes yet.");
            // console.log(err);
        }
    });
    bot.command("orchaimm", async (ctx) => {
        ctx.reply("Please wait for a moment.");
        let chatId = ctx.chat?.id.toString();
        let eventType = constants_1.EVENT_TYPE.ORCHAI;
        let eventId = (0, sha256_1.default)(eventType + "_" + chatId);
        let event = await event_repository_1.default.findByEventId(eventId);
        if (!event) {
            event_repository_1.default.create(eventId, chatId, eventType, {});
        }
        event = await event_repository_1.default.findByEventId(eventId);
        let walletAddress = event?.params?.get("walletAddress");
        let messageText = cron_job_1.moneyMarketInfo.message;
        if (walletAddress) {
            let borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, walletAddress);
            let netAPY = (borrowerInfo.totalLend * cron_job_1.moneyMarketInfo.lendAPY -
                borrowerInfo.loanAmount * cron_job_1.moneyMarketInfo.borrowAPY) /
                (borrowerInfo.totalLend + borrowerInfo.loanAmount) || 0;
            messageText += message_creation_1.default.borrowerInfo(walletAddress, borrowerInfo, netAPY.toFixed(2));
            messageText += "\n" + "You can type /orchaimm for fast information";
        }
        else {
            messageText +=
                "Setting your wallet address to see your profile at Orchai Money Market";
        }
        ctx.replyWithMarkdownV2(messageText);
    });
    bot.command("liquidation", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid protocol");
        }
        else {
            let protocol = tmp[1].toLowerCase();
            let listSupportedProtocol = ["aave", "venus"];
            if (listSupportedProtocol.includes(protocol)) {
                let marketData = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.OTHER_PROTOCOLS_LIQUIDATION_LIST +
                    "_" +
                    protocol);
                let data = marketData?.data.splice(0, 200);
                let message = getPaginatedLiquidationList(data, 1, "ll_" + protocol);
                ctx.replyWithMarkdownV2(message.text, {
                    reply_markup: message.replyMarkup,
                });
            }
            else {
                ctx.reply("We do not support this protocol");
            }
        }
    });
    bot.command("lendingapy", async (ctx) => {
        let data = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.OTHER_PROTOCOLS_APY);
        let messageText = `APY for Lending USDT Across Protocols\n` +
            `*Orchai Money Market* (On Oraichain): ${data?.data["orchaiDepositAPY"]}%\n` +
            `*AaveV2* (On Ethereum): ${data?.data["aaveDepositAPY"]}%\n` +
            `*Venus* (On Binance Smart Chain): ${data?.data["venusDepositAPY"]}%\n` +
            `You can type /lendingapy for fast information\n`;
        ctx.replyWithMarkdownV2(message_creation_1.default.escapeMessage(messageText));
    });
    bot.on("callback_query", async (ctx) => {
        try {
            let callbackData = JSON.parse(ctx.callbackQuery.data);
            if (callbackData.type == "ll_aave") {
                let marketData = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.OTHER_PROTOCOLS_LIQUIDATION_LIST + "_aave");
                let data = marketData?.data.splice(0, 200);
                let message = getPaginatedLiquidationList(data, callbackData.action == "next"
                    ? callbackData.current + 1
                    : callbackData.current - 1, "ll_aave");
                ctx.editMessageText(message.text, {
                    reply_markup: message.replyMarkup,
                    parse_mode: "MarkdownV2",
                });
            }
            else if (callbackData.type == "ll_venus") {
                let marketData = await market_data_repository_1.default.findByType(constants_1.MARKET_DATA_TYPE.OTHER_PROTOCOLS_LIQUIDATION_LIST + "_venus");
                let data = marketData?.data.splice(0, 200);
                let message = getPaginatedLiquidationList(data, callbackData.action == "next"
                    ? callbackData.current + 1
                    : callbackData.current - 1, "ll_venus");
                ctx.editMessageText(message.text, {
                    reply_markup: message.replyMarkup,
                    parse_mode: "MarkdownV2",
                });
            }
        }
        catch (err) {
            console.log("here");
        }
        finally {
            ctx.answerCbQuery();
        }
    });
    bot.on("text", async (ctx) => {
        let message = message_1.default.hello();
        ctx.replyWithMarkdownV2(message.text, {
            reply_markup: message.replyMarkup,
        });
    });
    async function sendMessage(chatId, msg) {
        try {
            await bot.telegram.sendMessage(chatId, msg, {
                parse_mode: "MarkdownV2",
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    TelegramBot.sendMessage = sendMessage;
    async function sendPhoto(chatId, photo) {
        try {
            await bot.telegram.sendPhoto(chatId, { source: photo });
        }
        catch (err) {
            console.log(err);
        }
    }
    TelegramBot.sendPhoto = sendPhoto;
    async function launchBot() {
        cosmwasmClient = await cosmwasm_1.default.getCosmWasmClient();
        bot.launch();
    }
    TelegramBot.launchBot = launchBot;
})(TelegramBot || (exports.TelegramBot = TelegramBot = {}));
function getPaginatedLiquidationList(data, page, type) {
    let dataLength = data.length;
    let maxPage = Math.ceil(dataLength / constants_1.rowPerPage);
    let replyMarkup = {
        inline_keyboard: [
            page == 1
                ? [
                    {
                        text: "next page",
                        callback_data: JSON.stringify({
                            action: "next",
                            current: page,
                            type: type,
                        }),
                    },
                ]
                : page == maxPage
                    ? [
                        {
                            text: "previous page",
                            callback_data: JSON.stringify({
                                action: "previous",
                                current: page,
                                type: type,
                            }),
                        },
                    ]
                    : [
                        {
                            text: "previous page",
                            callback_data: JSON.stringify({
                                action: "previous",
                                current: page,
                                type: type,
                            }),
                        },
                        {
                            text: "next page",
                            callback_data: JSON.stringify({
                                action: "next",
                                current: page,
                                type: type,
                            }),
                        },
                    ],
        ],
    };
    let dataTable = [];
    dataTable.push(["#", "``address``", "deposited", "borrowed"]);
    for (let i = 0; i < constants_1.rowPerPage; i++) {
        let dataIndex = (page - 1) * constants_1.rowPerPage + i;
        dataTable.push([
            dataIndex + 1,
            "``" + data[dataIndex]["address"] + "``",
            utils_1.default.stringifyNumberToUSD(data[dataIndex]["deposit"]),
            utils_1.default.stringifyNumberToUSD(data[dataIndex]["borrow"]),
        ]);
    }
    let text = "`\n" +
        (0, table_1.table)(dataTable, {
            drawHorizontalLine: () => false,
            drawVerticalLine: () => false,
        }) +
        "`";
    console.log(text);
    return {
        text: text,
        replyMarkup: replyMarkup,
    };
}
