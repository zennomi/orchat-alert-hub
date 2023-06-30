import { Markup } from "telegraf";
import { SUPPORTED_TOKEN } from "../constants";
import MessageCreation from "./message-creation";

namespace Message {
    export function hello() {
        return {
            text: MessageCreation.escapeMessage(
                "Welcome to Orchai Alert Hub! I'm here to assist you. How can I help you today?"
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Getting information",
                            callback_data: "getting_information",
                        },
                    ],
                    [
                        {
                            text: "Setting Alert",
                            callback_data: "setting_alert",
                        },
                    ],
                    [
                        {
                            text: "Join Orchai group",
                            url: "https://t.me/orchaiofficial",
                        },
                    ],
                ],
            },
        };
    }

    export function gettingInformation() {
        return {
            text: MessageCreation.escapeMessage(
                "What kind of information are you looking for?"
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Get token info",
                            callback_data: "get_token_info",
                        },
                    ],
                    [
                        {
                            text: "Get Orchai Money Market Info",
                            callback_data: "get_orchai_money_market_info",
                        },
                    ],
                    [
                        {
                            text: "Get lending APY across protocols",
                            callback_data: "get_lending_apy_across_protocols",
                        },
                    ],
                    [
                        {
                            text: "Get users eligible for liquidation",
                            callback_data: "get_users_eligible_for_liquidation",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "getting_information_back",
                        },
                    ],
                ],
            },
        };
    }

    export function getTokenInfo() {
        let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
        let tokens = "";
        for (let i = 0; i < listSupportedToken.length; i++) {
            tokens += `*${listSupportedToken[i]}*`;
            if (i != listSupportedToken.length - 1) {
                tokens += ", ";
            } else {
                tokens += ".";
            }
        }

        return {
            text: MessageCreation.escapeMessage(
                "/p token - Get prices of the coin \n" +
                    "/c token - Get token price chart \n" +
                    "/cm token - Get token market cap chart \n" +
                    "/calc token <amount> - Calculate the price of an amount token \n" +
                    "/top - Return top 10 market token \n" +
                    "/supportedtoken - Return supported token \n" +
                    "Currently we support: " +
                    tokens
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Back",
                            callback_data: "get_token_info_back",
                        },
                    ],
                ],
            },
        };
    }

    export function getOrchaiMoneyMarketInfo() {
        return {
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Refresh",
                            callback_data:
                                "get_orchai_money_market_info_refresh",
                        },
                    ],
                    [
                        {
                            text: "Set your wallet address",
                            callback_data:
                                "get_orchai_money_market_info_set_wallet_address",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "get_orchai_money_market_info_back",
                        },
                    ],
                ],
            },
        };
    }

    export function getLendingAPYAcrossProtocols() {
        return {
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Back",
                            callback_data:
                                "get_lending_apy_across_protocols_back",
                        },
                    ],
                ],
            },
        };
    }

    export function getUsersEligibleForLiquidation() {
        return {
            text: MessageCreation.escapeMessage(
                `Select a protocol to retrieve a list of users who are eligible to be liquidated.\n` +
                    `You can type /liquidation <protocol> for fast information.`
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Aave",
                            callback_data:
                                "get_users_eligible_for_liquidation_aave",
                        },
                    ],
                    [
                        {
                            text: "Venus",
                            callback_data:
                                "get_users_eligible_for_liquidation_venus",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data:
                                "get_users_eligible_for_liquidation_back",
                        },
                    ],
                ],
            },
        };
    }

    export function settingAlert() {
        return {
            text: MessageCreation.escapeMessage(
                "Which service would you like to set an alert for?"
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Orchai Money Market",
                            callback_data: "setting_alert_orchai",
                        },
                    ],
                    [
                        {
                            text: "OraiDEX OrderBook",
                            callback_data: "setting_alert_orai_dex",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "setting_alert_back",
                        },
                    ],
                ],
            },
        };
    }

    export function settingAlertOrchai(
        walletAddress: string,
        capacityThreshold: string,
        notificationStatus: boolean
    ) {
        return {
            text: MessageCreation.escapeMessage(
                "We'll notify you when your borrowed capacity falls below the warning threshold \n" +
                    "*Current setting*: \n" +
                    (walletAddress
                        ? `Your wallet address: \`${walletAddress}\`\n`
                        : `You have not set wallet address\n`) +
                    `Your current warning threshold: ${capacityThreshold}%\n` +
                    `Notification status: ${
                        notificationStatus ? "*ON*" : "*OFF*"
                    }\n`
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Set your wallet address",
                            callback_data:
                                "setting_alert_orchai_wallet_address",
                        },
                    ],
                    [
                        {
                            text: "Set your borrow capacity warning",
                            callback_data:
                                "setting_alert_orchai_capacity_threshold",
                        },
                    ],
                    [
                        {
                            text: notificationStatus
                                ? "Turn off notification"
                                : "Turn on notification",
                            callback_data:
                                "setting_alert_orchai_toggle_notification_status",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "setting_alert_orchai_back",
                        },
                    ],
                ],
            },
        };
    }

    export function settingAlertOraiDEX(
        walletAddress: string,
        notificationStatus: boolean
    ) {
        return {
            text: MessageCreation.escapeMessage(
                "We'll notify you when you create or close an order, as well as your order is fulfilled\n" +
                    "*Current setting*: \n" +
                    (walletAddress
                        ? `Your wallet address: \`${walletAddress}\`\n`
                        : `You have not set wallet address\n`) +
                    `Notification status: ${
                        notificationStatus ? "*ON*" : "*OFF*"
                    }\n`
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Set your wallet address",
                            callback_data:
                                "setting_alert_orai_dex_wallet_address",
                        },
                    ],
                    [
                        {
                            text: notificationStatus
                                ? "Turn off notification"
                                : "Turn on notification",
                            callback_data:
                                "setting_alert_orai_dex_toggle_notification_status",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "setting_alert_orai_dex_back",
                        },
                    ],
                ],
            },
        };
    }
}

export default Message;
