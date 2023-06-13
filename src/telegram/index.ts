import axios, { AxiosResponse } from "axios";
import { Telegraf, Scenes, Markup, Context, session } from "telegraf";
import { CosmWasmClient, coin } from "cosmwasm";
import sha256 from "sha256";
import CosmWasm from "../cosmwasm";
import UserRepository from "../repository/user-repository";
import OrchaiLending from "../cosmwasm/orchai-lending";
import MessageCreation from "./message-creation";
import {
    CGMappingID,
    EVENT_TYPE,
    MARKET_DATA_TYPE,
    SUPPORTED_TOKEN,
    memeAPI,
    quoteAPI,
} from "../constants";
import EventRepository from "../repository/event-repository";
import {
    setOrchaiCapacityThresholdScene,
    setOrchaiWalletAddressScene,
    setOraiDEXWalletAddressScene,
} from "./scenes/index";
import MarketDataRepository from "../repository/market-data-repository";
import CoinGecko from "../market/coin-gecko";
import Message from "./message";
import TokenRepository from "../repository/token-repository";
import { moneyMarketInfo } from "../tasks/cron-job";

const { BOT_TOKEN } = process.env;
var cosmwasmClient: CosmWasmClient;
namespace TelegramBot {
    const bot = new Telegraf(BOT_TOKEN as string);
    const stage = new Scenes.Stage([
        setOrchaiWalletAddressScene,
        setOrchaiCapacityThresholdScene,
        setOraiDEXWalletAddressScene,
    ] as any);
    bot.use(session());
    bot.use(stage.middleware() as any);
    // anti bot middleware
    bot.use((ctx, next) => {
        let message = ctx.message;
        if (!ctx.from?.is_bot) {
            return next();
        } else {
            ctx.reply("You are bot!!!");
        }
    });

    bot.start(async (ctx) => {
        let message = Message.hello();
        ctx.replyWithMarkdownV2(message.text, {
            reply_markup: message.replyMarkup,
        });
        let chatId = ctx.chat.id;
        let userInfo = ctx.from;
        let user = await UserRepository.findByChatId(chatId);
        if (!user) {
            await UserRepository.createUser(
                chatId,
                userInfo.id,
                userInfo.first_name,
                userInfo.last_name,
                userInfo.username,
                userInfo.language_code
            );
        }
    });

    bot.action("getting_information", async (ctx) => {
        let message = Message.gettingInformation();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("get_token_info", async (ctx) => {
        let message = Message.getTokenInfo();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("get_token_info_back", async (ctx) => {
        let message = Message.gettingInformation();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("get_orchai_money_market_info", async (ctx) => {
        ctx.reply("Wait me a minute!");
        let message = Message.getOrchaiMoneyMarketInfo();

        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        if (!event) {
            EventRepository.create(eventId, chatId, eventType, {});
        }
        event = await EventRepository.findByEventId(eventId);

        let walletAddress = event?.params?.get("walletAddress");
        let messageText = moneyMarketInfo.message;

        if (walletAddress) {
            let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                cosmwasmClient,
                walletAddress
            );
            let netAPY =
                (borrowerInfo.totalLend * Number(moneyMarketInfo.lendAPY) -
                    borrowerInfo.loanAmount *
                        Number(moneyMarketInfo.borrowAPY)) /
                (borrowerInfo.totalLend + borrowerInfo.loanAmount);
            messageText +=
                `*Your wallet address*: \`${walletAddress}\`\n` +
                `Lend: $${borrowerInfo.totalLend}\n` +
                `Collaterals: $${borrowerInfo.totalCollateralsValue}\n` +
                `Borrow limit: $${borrowerInfo.borrowLimit}\n` +
                `Borrow: $${borrowerInfo.loanAmount}\n` +
                `Borrow capacity: ${borrowerInfo.capacity}%\n` +
                `Net APY: ${netAPY}%\n`;
            messageText += "\n" + "You can type /orchaimm for fast information";
        } else {
            messageText +=
                "Setting your wallet address to see your profile at Orchai Money Market";
        }

        ctx.editMessageText(MessageCreation.escapeMessage(messageText), {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("get_orchai_money_market_info_refresh", async (ctx) => {
        ctx.reply("Wait me a minute!");
        let message = Message.getOrchaiMoneyMarketInfo();

        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        if (!event) {
            EventRepository.create(eventId, chatId, eventType, {});
        }
        event = await EventRepository.findByEventId(eventId);

        let walletAddress = event?.params?.get("walletAddress");
        let messageText = moneyMarketInfo.message;

        if (walletAddress) {
            let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                cosmwasmClient,
                walletAddress
            );
            let netAPY =
                (borrowerInfo.totalLend * Number(moneyMarketInfo.lendAPY) -
                    borrowerInfo.loanAmount *
                        Number(moneyMarketInfo.borrowAPY)) /
                (borrowerInfo.totalLend + borrowerInfo.loanAmount);
            messageText +=
                `*Your wallet address*: \`${walletAddress}\`\n` +
                `Lend: $${borrowerInfo.totalLend}\n` +
                `Collaterals: $${borrowerInfo.totalCollateralsValue}\n` +
                `Borrow limit: $${borrowerInfo.borrowLimit}\n` +
                `Borrow: $${borrowerInfo.loanAmount}\n` +
                `Borrow capacity: ${borrowerInfo.capacity}%\n` +
                `Net APY: ${netAPY}%\n`;
            messageText += "\n" + "You can type /orchaimm for fast information";
        } else {
            messageText +=
                "Setting your wallet address to see your profile at Orchai Money Market";
        }

        ctx.editMessageText(MessageCreation.escapeMessage(messageText), {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });
    bot.action(
        "get_orchai_money_market_info_set_wallet_address",
        Scenes.Stage.enter("set_orchai_wallet_address") as any
    );

    bot.action("get_orchai_money_market_info_back", async (ctx) => {
        let message = Message.gettingInformation();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("getting_information_back", async (ctx) => {
        let message = Message.hello();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.action("setting_alert", async (ctx) => {
        let message = Message.settingAlert();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("setting_alert_orchai", async (ctx) => {
        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        let notificationStatus = false;
        if (!event) {
            EventRepository.create(eventId, chatId, eventType, {});
        } else {
            notificationStatus = event.notificationStatus;
        }
        event = await EventRepository.findByEventId(eventId);
        let walletAddress = event?.params?.get("walletAddress") || "";
        let capacityThreshold = event?.params?.get("capacityThreshold") || "0";

        let message = Message.settingAlertOrchai(
            walletAddress,
            capacityThreshold,
            notificationStatus
        );
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action(
        "setting_alert_orchai_wallet_address",
        Scenes.Stage.enter("set_orchai_wallet_address") as any
    );
    bot.action(
        "setting_alert_orchai_capacity_threshold",
        Scenes.Stage.enter("set_orchai_capacity_threshold") as any
    );
    bot.action(
        "setting_alert_orchai_toggle_notification_status",
        async (ctx) => {
            let chatId: string = ctx.chat?.id.toString() as string;
            let eventType = EVENT_TYPE.ORCHAI;
            let eventId = sha256(eventType + "_" + chatId);
            let event = await EventRepository.findByEventId(eventId);
            let notificationStatus = !event?.notificationStatus;
            await EventRepository.updateNotificationStatus(
                eventId,
                notificationStatus
            );
            let message = Message.settingAlertOrchai(
                event?.params?.get("walletAddress") || "",
                event?.params?.get("capacityThreshold") || "0",
                notificationStatus
            );
            ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
    );

    bot.action("setting_alert_orchai_back", async (ctx) => {
        let message = Message.settingAlert();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("setting_alert_orai_dex", async (ctx) => {
        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORAI_DEX;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        let notificationStatus = false;
        if (!event) {
            EventRepository.create(eventId, chatId, eventType, {});
        } else {
            notificationStatus = event.notificationStatus;
        }
        event = await EventRepository.findByEventId(eventId);
        let walletAddress = event?.params?.get("walletAddress") || "";
        let message = Message.settingAlertOraiDEX(
            walletAddress,
            notificationStatus
        );
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action(
        "setting_alert_orai_dex_wallet_address",
        Scenes.Stage.enter("set_orai_dex_wallet_address") as any
    );

    bot.action(
        "setting_alert_orai_dex_toggle_notification_status",
        async (ctx) => {
            let chatId: string = ctx.chat?.id.toString() as string;
            let eventType = EVENT_TYPE.ORAI_DEX;
            let eventId = sha256(eventType + "_" + chatId);
            let event = await EventRepository.findByEventId(eventId);
            let notificationStatus = !event?.notificationStatus;
            await EventRepository.updateNotificationStatus(
                eventId,
                notificationStatus
            );
            let message = Message.settingAlertOraiDEX(
                event?.params?.get("walletAddress") || "",
                notificationStatus
            );
            ctx.editMessageText(message.text, {
                reply_markup: message.replyMarkup,
                parse_mode: "MarkdownV2",
            });
        }
    );

    bot.action("setting_alert_orai_dex_back", async (ctx) => {
        let message = Message.settingAlert();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
            parse_mode: "MarkdownV2",
        });
    });

    bot.action("setting_alert_back", async (ctx) => {
        let message = Message.hello();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.command("p", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        } else {
            let tokenStr = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
            if (listSupportedToken.includes(tokenStr)) {
                let tokenDenom = SUPPORTED_TOKEN[tokenStr];
                let token = await TokenRepository.findByDenom(tokenDenom);
                let message =
                    `Token: *${tokenStr}*\n` +
                    `Price: $${token?.price}\n` +
                    `1h change: ${token?.percentageChange1h}%\n` +
                    `24h change: ${token?.percentageChange24h}%`;
                ctx.replyWithMarkdownV2(MessageCreation.escapeMessage(message));
            } else {
                ctx.reply("We do not support this token");
            }
        }
    });
    bot.command("c", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        } else {
            let tokenStr = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
            if (listSupportedToken.includes(tokenStr)) {
                let dataType =
                    MARKET_DATA_TYPE.TOKEN + "_" + SUPPORTED_TOKEN[tokenStr];
                let data = await MarketDataRepository.findByType(dataType);
                if (data?.photo) {
                    let photo = (data.photo as any)[0].buffer as Buffer;
                    ctx.replyWithPhoto({ source: photo });
                }
            } else {
                ctx.reply("We do not support this token");
            }
        }
    });

    bot.command("cm", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        } else {
            let tokenStr = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
            if (listSupportedToken.includes(tokenStr)) {
                let dataType =
                    MARKET_DATA_TYPE.TOKEN + "_" + SUPPORTED_TOKEN[tokenStr];
                let data = await MarketDataRepository.findByType(dataType);
                let tokenDenom = SUPPORTED_TOKEN[tokenStr];
                let token = await TokenRepository.findByDenom(tokenDenom);
                let message =
                    `Token: *${tokenStr}*\n` +
                    `Market cap: $${token?.marketCap}\n` +
                    `24h Volume: $${token?.volume24h}\n` +
                    `24h Volume change: ${token?.volumeChange24h}%`;
                ctx.replyWithMarkdownV2(MessageCreation.escapeMessage(message));
                if (data?.photo) {
                    let photo = (data.photo as any)[1].buffer as Buffer;
                    ctx.replyWithPhoto({ source: photo });
                }
            } else {
                ctx.reply("We do not support this token");
            }
        }
    });

    bot.command("calc", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 3) {
            ctx.reply("Invalid value");
        } else {
            try {
                let tokenStr = tmp[1].toUpperCase();
                let number = Number(tmp[2]);
                if (number < 0 || Number.isNaN(number)) {
                    throw Error();
                }
                let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
                if (listSupportedToken.includes(tokenStr)) {
                    let dataType =
                        MARKET_DATA_TYPE.TOKEN +
                        "_" +
                        SUPPORTED_TOKEN[tokenStr];
                    let data = await MarketDataRepository.findByType(dataType);
                    let tokenDenom = SUPPORTED_TOKEN[tokenStr];
                    let token = await TokenRepository.findByDenom(tokenDenom);
                    let btc = await TokenRepository.findByDenom("btc");
                    let eth = await TokenRepository.findByDenom("eth");
                    let usdResult = number * Number(token?.price);
                    let btcResult = usdResult / Number(btc?.price);
                    let ethResult = usdResult / Number(eth?.price);
                    let message =
                        `Calculating ${tokenStr} ${number} \n` +
                        `${tokenStr} current price: $${token?.price}\n` +
                        `=> ${usdResult} USD\n` +
                        `=> ${btcResult} BTC\n` +
                        `=> ${ethResult} ETH\n`;
                    ctx.replyWithMarkdownV2(
                        MessageCreation.escapeMessage(message)
                    );
                } else {
                    ctx.reply("We do not support this token");
                }
            } catch (err) {
                ctx.reply("Invalid value");
            }
        }
    });

    bot.command("top", async (ctx) => {
        let result = await MarketDataRepository.findByType(
            MARKET_DATA_TYPE.TOP_10_MARKET_CAP
        );
        if (result?.photo) {
            let photo = (result.photo as any)[0].buffer as Buffer;
            ctx.replyWithPhoto({ source: photo });
        }
    });

    bot.command("meme", async (ctx) => {
        ctx.reply("Wait me a minute!!!");
        try {
            let memeResponse = await axios.get(memeAPI);
            if (memeResponse.status == 200) {
                let url = memeResponse.data.url;
                // limit 21429627 bytes
                try {
                    ctx.replyWithPhoto({ url: url });
                } catch (err) {
                    console.log(err);
                }
            } else {
                throw Error();
            }
        } catch (err) {
            ctx.reply("So sorry. I haven't come up with any memes yet.");
            console.log(err);
        }
    });

    bot.command("quote", async (ctx) => {
        ctx.reply("Wait me a minute!!!");
        try {
            let quoteResponse = await axios.get(quoteAPI);
            if (quoteResponse.status == 200) {
                let content = quoteResponse.data.content;
                let author = quoteResponse.data.author;
                let message = `"${content}" - ${author}`;
                ctx.reply(message);
            } else {
                throw Error();
            }
        } catch (err) {
            ctx.reply("So sorry. I haven't come up with any quotes yet.");
            console.log(err);
        }
    });

    bot.command("hello", async (ctx) => {
        let message = Message.hello();
        ctx.replyWithMarkdownV2(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.command("orchaimm", async (ctx) => {
        ctx.reply("Wait me a minute!");
        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        if (!event) {
            EventRepository.create(eventId, chatId, eventType, {});
        }
        event = await EventRepository.findByEventId(eventId);

        let walletAddress = event?.params?.get("walletAddress");
        let messageText = moneyMarketInfo.message;

        if (walletAddress) {
            let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                cosmwasmClient,
                walletAddress
            );
            let netAPY =
                (borrowerInfo.totalLend * Number(moneyMarketInfo.lendAPY) -
                    borrowerInfo.loanAmount *
                        Number(moneyMarketInfo.borrowAPY)) /
                (borrowerInfo.totalLend + borrowerInfo.loanAmount);
            messageText +=
                `*Your wallet address*: \`${walletAddress}\`\n` +
                `Lend: $${borrowerInfo.totalLend}\n` +
                `Collaterals: $${borrowerInfo.totalCollateralsValue}\n` +
                `Borrow limit: $${borrowerInfo.borrowLimit}\n` +
                `Borrow: $${borrowerInfo.loanAmount}\n` +
                `Borrow capacity: ${borrowerInfo.capacity}%\n` +
                `Net APY: ${netAPY}%\n`;
            messageText += "\n" + "You can type /orchaimm for fast information";
        } else {
            messageText +=
                "Setting your wallet address to see your profile at Orchai Money Market";
        }

        ctx.replyWithMarkdownV2(MessageCreation.escapeMessage(messageText));
    });

    bot.on("text", async (ctx) => {
        let message = Message.hello();
        ctx.replyWithMarkdownV2(message.text, {
            reply_markup: message.replyMarkup,
        });
    });
    export async function sendMessage(chatId: string, msg: string) {
        try {
            await bot.telegram.sendMessage(chatId, msg, {
                parse_mode: "MarkdownV2",
            });
        } catch (err) {
            console.log(err);
        }
    }

    export async function sendPhoto(chatId: string, photo: Buffer) {
        try {
            await bot.telegram.sendPhoto(chatId, { source: photo });
        } catch (err) {
            console.log(err);
        }
    }

    export async function launchBot() {
        cosmwasmClient = await CosmWasm.getCosmWasmClient();
        bot.launch();
        console.log("Bot is working . . .");
    }
}

export { TelegramBot };
