namespace MessageSubscription {
    export const subscribe = () => {
        return {
            text: "Which service do you want to subscribe",
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Orchai",
                            callback_data: "subscribe_orchai",
                        },
                    ],
                    [
                        {
                            text: "OraiDex",
                            callback_data: "subscribe_orai_dex",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "subscribe_orai_dex",
                        },
                    ],
                ],
            },
        };
    };

    export const subscribeOrchai = (notificationStatus: boolean) => {
        return {
            text: "Which information do you want to config",
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Wallet address",
                            callback_data: "subscribe_orchai_wallet_address",
                        },
                    ],
                    [
                        {
                            text: "Borrow capacity",
                            callback_data: "subscribe_orchai_capacity_threshold",
                        },
                    ],
                    [
                        {
                            text: notificationStatus
                                ? "Turn off notification"
                                : "Turn on notification",
                            callback_data:
                                "subscribe_orchai_toggle_notification_status",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "subscribe_orchai_back",
                        },
                    ],
                ],
            },
        };
    };

    export const subscribeOraiDex = (notificationStatus: boolean) => {
        return {
            text: "Which information do you want to config",
            replyMarkup: {
                inline_keyboard: [
                    [
                        {
                            text: "Wallet address",
                            callback_data: "subscribe_orai_dex_wallet_address",
                        },
                    ],
                    [
                        {
                            text: notificationStatus
                                ? "Turn off notification"
                                : "Turn on notification",
                            callback_data:
                                "subscribe_orai_dex_toggle_notification_status",
                        },
                    ],
                    [
                        {
                            text: "Back",
                            callback_data: "subscribe_orai_dex_back",
                        },
                    ],
                ],
            },
        };
    };
}

export default MessageSubscription;
