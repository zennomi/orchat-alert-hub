import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { CosmWasmClient, fromBase64, fromUtf8 } from "cosmwasm";
import { w3cwebsocket } from "websocket";

import CosmWasm from "../cosmwasm";
import OrchaiLending from "../cosmwasm/orchai-lending";
import { TelegramBot } from "../telegram";
import MessageCreation from "../telegram/message-creation";
import EventRepository from "../repository/event-repository";
import { EVENT_TYPE } from "../constants";

const {
    ADDRESS_ORAISWAP_LIMIT_ORDER,
    ADDRESS_OVERSEER,
    ADDRESS_LIQUIDATION_QUEUE,
    ADDRESS_ORACLE,
    ADDRESS_MONEY_MARKET,
    ADDRESS_SORAI_CUSTODY,
    ADDRESS_SCORAI_CUSTODY,
    ADDRESS_STATOM_CUSTODY,
    ADDRESS_STOSMO_CUSTODY,
    ADDRESS_USDT,
    WS_RPC_ORAI,
    WS_RPC_ORAI_TESTNET,
} = process.env;

var idCounter = 0;

namespace EventListener {
    export async function start() {
        let cosmwasmClient = await CosmWasm.getCosmWasmClient();
        liquidateEventListener(cosmwasmClient);
        borrowStableListener(cosmwasmClient);
        borrowLeverageStableListener(cosmwasmClient);
        withdrawCollateralListener(
            cosmwasmClient,
            ADDRESS_SORAI_CUSTODY as string
        );
        withdrawCollateralListener(
            cosmwasmClient,
            ADDRESS_SCORAI_CUSTODY as string
        );
        withdrawCollateralListener(
            cosmwasmClient,
            ADDRESS_STATOM_CUSTODY as string
        );
        withdrawCollateralListener(
            cosmwasmClient,
            ADDRESS_STOSMO_CUSTODY as string
        );
        submitOrderListener(cosmwasmClient);
        cancelOrderListener(cosmwasmClient);
        executeOrderbookPairListener(cosmwasmClient);
    }

    export function liquidateEventListener(cosmwasmClient: CosmWasmClient) {
        let webSocketClient = new w3cwebsocket(
            (WS_RPC_ORAI as string) + "/websocket"
        );
        webSocketClient.onopen = () => {
            webSocketClient.send(
                JSON.stringify({
                    jsonrpc: "2.0",
                    method: "subscribe",
                    id: idCounter.toString(),
                    params: {
                        query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_LIQUIDATION_QUEUE}' AND wasm.action='liquidate_collateral'`,
                    },
                })
            );
        };

        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data as string);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                let filteredAttributes = filterAttributesKey(
                    attributes,
                    "borrower"
                );

                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents =
                    await EventRepository.findByWalletAddressAndType(
                        borrowerAddress,
                        EVENT_TYPE.ORCHAI
                    );

                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let chatId = event.chatId;
                    const borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                        cosmwasmClient,
                        borrowerAddress
                    );

                    TelegramBot.sendMessage(
                        chatId,
                        MessageCreation.liquidationAlert(borrowerInfo)
                    );
                }
            }
        };
    }

    export function borrowLeverageStableListener(
        cosmwasmClient: CosmWasmClient
    ) {
        let webSocketClient = new w3cwebsocket(
            (WS_RPC_ORAI as string) + "/websocket"
        );
        webSocketClient.onopen = () => {
            webSocketClient.send(
                JSON.stringify({
                    jsonrpc: "2.0",
                    method: "subscribe",
                    id: idCounter.toString(),
                    params: {
                        query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_MONEY_MARKET}' AND wasm.action='borrow_leverage_stable'`,
                    },
                })
            );
        };

        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data as string);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");

                let filteredAttributes = filterAttributesKey(
                    attributes,
                    "borrower"
                );

                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents =
                    await EventRepository.findByWalletAddressAndType(
                        borrowerAddress,
                        EVENT_TYPE.ORCHAI
                    );

                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                        cosmwasmClient,
                        borrowerAddress
                    );
                    let threshold =
                        Number(event.params?.get("capacityThreshold")) || 0;
                    if (
                        threshold > 0 &&
                        borrowerInfo.capacity * 100 >= threshold
                    ) {
                        TelegramBot.sendMessage(
                            event.chatId,
                            MessageCreation.capacityThresholdAlert(borrowerInfo)
                        );
                    }
                }
            }
        };
    }

    export function borrowStableListener(cosmwasmClient: CosmWasmClient) {
        let webSocketClient = new w3cwebsocket(
            (WS_RPC_ORAI as string) + "/websocket"
        );
        webSocketClient.onopen = () => {
            webSocketClient.send(
                JSON.stringify({
                    jsonrpc: "2.0",
                    method: "subscribe",
                    id: idCounter.toString(),
                    params: {
                        query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_MONEY_MARKET}' AND wasm.action='borrow_stable'`,
                    },
                })
            );
        };

        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data as string);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");

                let filteredAttributes = filterAttributesKey(
                    attributes,
                    "borrower"
                );

                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents =
                    await EventRepository.findByWalletAddressAndType(
                        borrowerAddress,
                        EVENT_TYPE.ORCHAI
                    );

                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                        cosmwasmClient,
                        borrowerAddress
                    );
                    let threshold =
                        Number(event.params?.get("capacityThreshold")) || 0;
                    if (
                        threshold > 0 &&
                        borrowerInfo.capacity * 100 >= threshold
                    ) {
                        TelegramBot.sendMessage(
                            event.chatId,
                            MessageCreation.capacityThresholdAlert(borrowerInfo)
                        );
                    }
                }
            }
        };
    }

    export function withdrawCollateralListener(
        cosmwasmClient: CosmWasmClient,
        collateralCustodyAddress: string
    ) {
        let webSocketClient = new w3cwebsocket(
            (WS_RPC_ORAI as string) + "/websocket"
        );
        webSocketClient.onopen = () => {
            webSocketClient.send(
                JSON.stringify({
                    jsonrpc: "2.0",
                    method: "subscribe",
                    id: idCounter.toString(),
                    params: {
                        query: `tm.event='Tx' AND wasm._contract_address='${collateralCustodyAddress}' AND wasm.action='withdraw_collateral'`,
                    },
                })
            );
        };

        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data as string);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");

                let filteredAttributes = filterAttributesKey(
                    attributes,
                    "borrower"
                );

                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents =
                    await EventRepository.findByWalletAddressAndType(
                        borrowerAddress,
                        EVENT_TYPE.ORCHAI
                    );

                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                        cosmwasmClient,
                        borrowerAddress
                    );
                    let threshold =
                        Number(event.params?.get("capacityThreshold")) || 0;
                    if (
                        threshold > 0 &&
                        borrowerInfo.capacity * 100 >= threshold
                    ) {
                        TelegramBot.sendMessage(
                            event.chatId,
                            MessageCreation.capacityThresholdAlert(borrowerInfo)
                        );
                    }
                }
            }
        };
    }

    export function submitOrderListener(cosmwasmClient: CosmWasmClient) {
        let webSocketClient = new w3cwebsocket(
            (WS_RPC_ORAI as string) + "/websocket"
        );
        webSocketClient.onopen = () => {
            webSocketClient.send(
                JSON.stringify({
                    jsonrpc: "2.0",
                    method: "subscribe",
                    id: idCounter.toString(),
                    params: {
                        query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_ORAISWAP_LIMIT_ORDER}' AND wasm.action='submit_order'`,
                    },
                })
            );
        };

        idCounter += 1;

        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data as string);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                for (let i = 0; i < attributes.length; i++) {
                    if (
                        base64ToText(attributes[i].value) ==
                            ADDRESS_ORAISWAP_LIMIT_ORDER &&
                        base64ToText(attributes[i + 1].value) == "submit_order"
                    ) {
                        let order: any = {};
                        for (let j = 0; j <= 8; j++) {
                            order[base64ToText(attributes[i + j].key)] =
                                base64ToText(attributes[i + j].value);
                        }
                        let message = "";
                        let offerAmount = Number(
                            order["offer_asset"].split(" ")[0]
                        );
                        let askAmount = Number(
                            order["ask_asset"].split(" ")[0]
                        );

                        if (order["direction"] == "Sell") {
                            message =
                                "sell " +
                                order["offer_asset"].toUpperCase() +
                                " with price " +
                                (askAmount / offerAmount).toFixed(4) +
                                " USDT/ORAI.";
                        } else {
                            message =
                                "buy " +
                                order["ask_asset"].toUpperCase() +
                                " with price " +
                                (offerAmount / askAmount).toFixed(4) +
                                " USDT/ORAI.";
                        }
                        message =
                            "OraiDEX: " +
                            order["bidder_addr"] +
                            " have submitted order with id " +
                            order["order_id"] +
                            ": " +
                            message;

                        let oraiDexEvents =
                            await EventRepository.findByWalletAddressAndType(
                                order["bidder_addr"],
                                EVENT_TYPE.ORAI_DEX
                            );
                        for (let j = 0; j < oraiDexEvents.length; j++) {
                            let event = oraiDexEvents[j];
                            TelegramBot.sendMessage(
                                event.chatId,
                                MessageCreation.escapeMessage(message)
                            );
                        }
                        i += 8;
                        // console.log(message);
                    }
                }
            }
        };
    }

    export function cancelOrderListener(cosmwasmClient: CosmWasmClient) {
        let webSocketClient = new w3cwebsocket(
            (WS_RPC_ORAI as string) + "/websocket"
        );
        webSocketClient.onopen = () => {
            webSocketClient.send(
                JSON.stringify({
                    jsonrpc: "2.0",
                    method: "subscribe",
                    id: idCounter.toString(),
                    params: {
                        query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_ORAISWAP_LIMIT_ORDER}' AND wasm.action='cancel_order'`,
                    },
                })
            );
        };

        idCounter += 1;

        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data as string);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                for (let i = 0; i < attributes.length; i++) {
                    if (
                        base64ToText(attributes[i].value) ==
                            ADDRESS_ORAISWAP_LIMIT_ORDER &&
                        base64ToText(attributes[i + 1].value) == "cancel_order"
                    ) {
                        let order: any = {};
                        let next = 0;
                        for (let j = 0; j <= 6; j++) {
                            order[base64ToText(attributes[i + j].key)] =
                                base64ToText(attributes[i + j].value);
                        }
                        let message = "";
                        if (
                            order["bidder_refund"].includes(
                                ADDRESS_USDT as string
                            )
                        ) {
                            next = 11;
                            message =
                                order["bidder_addr"] +
                                " have been refunded " +
                                order["bidder_refund"].replace(
                                    ADDRESS_USDT as string,
                                    " USDT."
                                );
                        } else {
                            next = 6;
                            message =
                                order["bidder_addr"] +
                                " have been refunded " +
                                order["bidder_refund"].replace(
                                    "orai",
                                    " ORAI."
                                );
                        }
                        message =
                            "OraiDEX: " +
                            order["bidder_addr"] +
                            " have cancelled order with id " +
                            order["order_id"] +
                            ". " +
                            message;

                        let oraiDexEvents =
                            await EventRepository.findByWalletAddressAndType(
                                order["bidder_addr"],
                                EVENT_TYPE.ORAI_DEX
                            );
                        for (let j = 0; j < oraiDexEvents.length; j++) {
                            let event = oraiDexEvents[j];
                            TelegramBot.sendMessage(
                                event.chatId,
                                MessageCreation.escapeMessage(message)
                            );
                        }
                        i += next;
                        // console.log(message);
                    }
                }
            }
        };
    }

    export function executeOrderbookPairListener(
        cosmwasmClient: CosmWasmClient
    ) {
        let webSocketClient = new w3cwebsocket(
            (WS_RPC_ORAI as string) + "/websocket"
        );
        webSocketClient.onopen = () => {
            webSocketClient.send(
                JSON.stringify({
                    jsonrpc: "2.0",
                    method: "subscribe",
                    id: idCounter.toString(),
                    params: {
                        query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_ORAISWAP_LIMIT_ORDER}' AND wasm.action='execute_orderbook_pair'`,
                    },
                })
            );
        };

        idCounter += 1;

        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data as string);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");

                let filteredAttributes = filterAttributesKey(
                    attributes,
                    "list_order_matched"
                );
                let listOrderMatchedStr: string = base64ToText(
                    filteredAttributes[0].value
                );
                listOrderMatchedStr = listOrderMatchedStr.replaceAll(
                    "Attribute",
                    ""
                );
                listOrderMatchedStr = listOrderMatchedStr.replaceAll(
                    "key",
                    '"key"'
                );
                listOrderMatchedStr = listOrderMatchedStr.replaceAll(
                    "value",
                    '"value"'
                );

                let listOrderMatchedObj = JSON.parse(listOrderMatchedStr);
                let orderIDs: string[] = [];
                for (let i = 0; i < listOrderMatchedObj.length; i++) {
                    orderIDs.push(listOrderMatchedObj[i][2]["value"]);
                }
                let fulfilledOrderIDs = [];
                let fulfilledOrders = [];
                let partialFilledOrders = [];
                for (let i = 0; i < listOrderMatchedObj.length; i++) {
                    let order = listOrderMatchedObj[i];
                    if (order[0]["value"] == "Fulfilled") {
                        fulfilledOrders.push({
                            bidderAddr: order[1]["value"],
                            orderID: order[2]["value"],
                            offerAmount: order[4]["value"],
                            filledOfferAmount: order[5]["value"],
                            askAmount: order[6]["value"],
                            filledAskAmount: order[7]["value"],
                        });
                        fulfilledOrderIDs.push(order[2]["value"]);
                    }
                }
                for (let i = 0; i < listOrderMatchedObj.length; i++) {
                    let order = listOrderMatchedObj[i];
                    if (
                        order[0]["value"] == "PartialFilled" &&
                        !fulfilledOrderIDs.includes(order[2]["value"])
                    ) {
                        partialFilledOrders.push({
                            bidderAddr: order[1]["value"],
                            orderID: order[2]["value"],
                            offerAmount: order[4]["value"],
                            filledOfferAmount: order[5]["value"],
                            askAmount: order[6]["value"],
                            filledAskAmount: order[7]["value"],
                        });
                    }
                }
                // console.log(fulfilledOrders);
                for (let i = 0; i < fulfilledOrders.length; i++) {
                    let order = fulfilledOrders[i];
                    let message =
                        "OraiDEX: " +
                        order.bidderAddr +
                        "'s orderbook pair with id " +
                        order.orderID +
                        " was filled " +
                        order.filledOfferAmount +
                        "/" +
                        order.offerAmount +
                        " offer amount";
                    let walletAddress = order.bidderAddr;
                    let oraiDexEvents =
                        await EventRepository.findByWalletAddressAndType(
                            walletAddress,
                            EVENT_TYPE.ORAI_DEX
                        );
                    for (let i = 0; i < oraiDexEvents.length; i++) {
                        let event = oraiDexEvents[i];
                        TelegramBot.sendMessage(event.chatId, message);
                    }
                }
                for (let i = 0; i < partialFilledOrders.length; i++) {
                    let order = partialFilledOrders[i];
                    let message =
                        "OraiDEX:" +
                        order.bidderAddr +
                        "'s orderbook pair with id " +
                        order.orderID +
                        " was filled " +
                        order.offerAmount +
                        "/" +
                        order.filledOfferAmount +
                        " offer amount";
                    let walletAddress = order.bidderAddr;
                    let oraiDexEvents =
                        await EventRepository.findByWalletAddressAndType(
                            walletAddress,
                            EVENT_TYPE.ORAI_DEX
                        );
                    for (let i = 0; i < oraiDexEvents.length; i++) {
                        let event = oraiDexEvents[i];
                        TelegramBot.sendMessage(event.chatId, message);
                    }
                }
            }
        };
    }
}

export default EventListener;

function isEmpty(object: Object) {
    return Object.keys(object).length === 0;
}

function filterEvents(events: any, requiredType: string) {
    let result: any[] = [];
    for (let i = 0; i < events.length; i++) {
        if (events[i].type == requiredType) {
            result = result.concat(events[i].attributes);
        }
    }
    return result;
}
function filterAttributesKey(attributes: any, requiredKey: string) {
    let result: any[] = [];
    for (let i = 0; i < attributes.length; i++) {
        if (base64ToText(attributes[i].key) == requiredKey) {
            result = result.concat(attributes[i]);
        }
    }
    return result;
}

function base64ToText(base64: any) {
    return fromUtf8(fromBase64(base64));
}
