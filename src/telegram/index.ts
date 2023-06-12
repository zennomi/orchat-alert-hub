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
import MessageSubscription from "./message-subscription";
import EventRepository from "../repository/event-repository";
import {
    setOrchaiCapacityThresholdScene,
    setOrchaiWalletAddressScene,
    setOraiDEXWalletAddressScene,
} from "./scenes/index";
import MarketDataRepository from "../repository/market-data-repository";
import CoinGecko from "../market/coin-gecko";

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
        ctx.reply("Hello, I'm Orchai chatbot");
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
    bot.help((ctx) => {
        ctx.replyWithMarkdownV2("");
    });

    bot.command("subscription", async (ctx) => {
        let message = MessageSubscription.subscribe();
        ctx.replyWithMarkdownV2(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.action("subscribe_orchai", async (ctx) => {
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
        let message = MessageSubscription.subscribeOrchai(notificationStatus);
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.action(
        "subscribe_orchai_wallet_address",
        Scenes.Stage.enter("set_orchai_wallet_address") as any
    );
    bot.action(
        "subscribe_orchai_capacity_threshold",
        Scenes.Stage.enter("set_orchai_capacity_threshold") as any
    );
    bot.action("subscribe_orchai_toggle_notification_status", async (ctx) => {
        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        let notificationStatus = !event?.notificationStatus;
        await EventRepository.updateNotificationStatus(
            eventId,
            notificationStatus
        );
        let message = MessageSubscription.subscribeOrchai(notificationStatus);
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.action("subscribe_orchai_back", async (ctx) => {
        let message = MessageSubscription.subscribe();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.action("subscribe_orai_dex", async (ctx) => {
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
        let message = MessageSubscription.subscribeOraiDex(notificationStatus);
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.action(
        "subscribe_orai_dex_wallet_address",
        Scenes.Stage.enter("set_orai_dex_wallet_address") as any
    );

    bot.action("subscribe_orai_dex_toggle_notification_status", async (ctx) => {
        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORAI_DEX;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        let notificationStatus = !event?.notificationStatus;
        await EventRepository.updateNotificationStatus(
            eventId,
            notificationStatus
        );
        let message = MessageSubscription.subscribeOraiDex(notificationStatus);
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.action("subscribe_orai_dex_back", async (ctx) => {
        let message = MessageSubscription.subscribe();
        ctx.editMessageText(message.text, {
            reply_markup: message.replyMarkup,
        });
    });

    bot.command("orchai", async (ctx) => {
        ctx.reply("Wait me a minute!!!");
        let chatId: string = ctx.chat?.id.toString() as string;
        let eventType = EVENT_TYPE.ORCHAI;
        let eventId = sha256(eventType + "_" + chatId);
        let event = await EventRepository.findByEventId(eventId);
        let orchaiInfo = await OrchaiLending.queryMarketInfo(cosmwasmClient);
        ctx.replyWithMarkdownV2(MessageCreation.orchaiInfo(orchaiInfo));
        let walletAddress = event?.params?.get("walletAddress");
        if (walletAddress) {
            let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                cosmwasmClient,
                walletAddress
            );
            ctx.replyWithMarkdownV2(MessageCreation.borrowerInfo(borrowerInfo));
        }
    });

    bot.command("top10cap", async (ctx) => {
        let result = await MarketDataRepository.findByType(
            MARKET_DATA_TYPE.TOP_10_MARKET_CAP
        );
        if (result?.photo) {
            let photo = (result.photo as any)[0].buffer as Buffer;
            ctx.replyWithPhoto({ source: photo });
        }
    });

    bot.command("token", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        } else {
            let token = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
            if (listSupportedToken.includes(token)) {
                let dataType =
                    MARKET_DATA_TYPE.TOKEN + "_" + SUPPORTED_TOKEN[token];
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

    bot.command("cap", async (ctx) => {
        let message = ctx.message.text;
        let tmp = message.split(" ");
        if (tmp.length < 2) {
            ctx.reply("Invalid token");
        } else {
            let token = tmp[1].toUpperCase();
            let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
            if (listSupportedToken.includes(token)) {
                let dataType =
                    MARKET_DATA_TYPE.TOKEN + "_" + SUPPORTED_TOKEN[token];
                let data = await MarketDataRepository.findByType(dataType);
                if (data?.photo) {
                    let photo = (data.photo as any)[1].buffer as Buffer;
                    ctx.replyWithPhoto({ source: photo });
                }
            } else {
                ctx.reply("We do not support this token");
            }
        }
    });

    bot.command("supportedtoken", async (ctx) => {
        let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
        let message =
            "List tokens we supported: " + listSupportedToken.toString();
        ctx.reply(message.replaceAll(",", ", "));
    });

    bot.command("meme", async (ctx) => {
        ctx.reply("Wait me a minute!!!");
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
        }
    });

    bot.command("quote", async (ctx) => {
        ctx.reply("Wait me a minute!!!");
        let quoteResponse = await axios.get(quoteAPI);
        if (quoteResponse.status == 200) {
            let content = quoteResponse.data.content;
            let author = quoteResponse.data.author;
            let message = `"${content}" - ${author}`;
            ctx.reply(message);
        } else {
        }
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
