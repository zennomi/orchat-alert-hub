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
                            callback_data: "join_orchai_group",
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
                            text: "Back",
                            callback_data: "getting_information_back",
                        },
                    ],
                ],
            },
        };
    }

    export function getTokenInfo() {
        return {
            text: MessageCreation.escapeMessage(
                "/p token - Get prices of the coin \n" +
                    "/c token - Get token price chart \n" +
                    "/cm token - Get token market cap chart \n" +
                    "/calc token <amount> - Calculate the price of an amount token \n" +
                    "/top - Return top 10 market token \n" +
                    "/top cosmos - Return top 10 token on cosmos ecosystem \n" +
                    "/supportedtoken - Return supported token \n" +
                    "Currently we support: *ORAI*, *ATOM*, *OSMO*, *BTC*, *ETH*."
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

    export function settingAlert() {
        return {
            text: MessageCreation.escapeMessage(
                "Which service would you like to set an alert for?"
            ),
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Orchai",
                            callback_data: "setting_alert_orchai",
                        },
                    ],
                    [
                        {
                            text: "OraiDex",
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
                    `Your wallet address: ${walletAddress}\n` +
                    `Your current warning threshold: ${capacityThreshold}%\n` +
                    `Notification status ${notificationStatus ? "ON" : "OFF"}\n`
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
                "We'll notify you when you create or close an order, as well as your order is fulfilled" +
                    "*Current setting*: \n" +
                    `Your wallet address: ${walletAddress}\n`
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
