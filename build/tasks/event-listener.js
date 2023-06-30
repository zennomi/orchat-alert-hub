"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cosmwasm_1 = require("cosmwasm");
const websocket_1 = require("websocket");
const cosmwasm_2 = __importDefault(require("../cosmwasm"));
const orchai_lending_1 = __importDefault(require("../cosmwasm/orchai-lending"));
const telegram_1 = require("../telegram");
const message_creation_1 = __importDefault(require("../telegram/message-creation"));
const event_repository_1 = __importDefault(require("../repository/event-repository"));
const constants_1 = require("../constants");
const { ADDRESS_ORAISWAP_LIMIT_ORDER, ADDRESS_OVERSEER, ADDRESS_LIQUIDATION_QUEUE, ADDRESS_ORACLE, ADDRESS_MONEY_MARKET, ADDRESS_SORAI_CUSTODY, ADDRESS_SCORAI_CUSTODY, ADDRESS_STATOM_CUSTODY, ADDRESS_STOSMO_CUSTODY, ADDRESS_USDT, WS_RPC_ORAI, WS_RPC_ORAI_TESTNET, } = process.env;
var idCounter = 0;
var EventListener;
(function (EventListener) {
    async function start() {
        let cosmwasmClient = await cosmwasm_2.default.getCosmWasmClient();
        liquidateEventListener(cosmwasmClient);
        borrowStableListener(cosmwasmClient);
        borrowLeverageStableListener(cosmwasmClient);
        withdrawCollateralListener(cosmwasmClient, ADDRESS_SORAI_CUSTODY);
        withdrawCollateralListener(cosmwasmClient, ADDRESS_SCORAI_CUSTODY);
        withdrawCollateralListener(cosmwasmClient, ADDRESS_STATOM_CUSTODY);
        withdrawCollateralListener(cosmwasmClient, ADDRESS_STOSMO_CUSTODY);
        submitOrderListener(cosmwasmClient);
        cancelOrderListener(cosmwasmClient);
        executeOrderbookPairListener(cosmwasmClient);
    }
    EventListener.start = start;
    function liquidateEventListener(cosmwasmClient) {
        let webSocketClient = new websocket_1.w3cwebsocket(WS_RPC_ORAI + "/websocket");
        webSocketClient.onopen = () => {
            webSocketClient.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "subscribe",
                id: idCounter.toString(),
                params: {
                    query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_LIQUIDATION_QUEUE}' AND wasm.action='liquidate_collateral'`,
                },
            }));
        };
        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                let filteredAttributes = filterAttributesKey(attributes, "borrower");
                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents = await event_repository_1.default.findByWalletAddressAndType(borrowerAddress, constants_1.EVENT_TYPE.ORCHAI);
                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let chatId = event.chatId;
                    const borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, borrowerAddress);
                    telegram_1.TelegramBot.sendMessage(chatId, message_creation_1.default.liquidationAlert(borrowerInfo));
                }
            }
        };
    }
    EventListener.liquidateEventListener = liquidateEventListener;
    function borrowLeverageStableListener(cosmwasmClient) {
        let webSocketClient = new websocket_1.w3cwebsocket(WS_RPC_ORAI + "/websocket");
        webSocketClient.onopen = () => {
            webSocketClient.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "subscribe",
                id: idCounter.toString(),
                params: {
                    query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_MONEY_MARKET}' AND wasm.action='borrow_leverage_stable'`,
                },
            }));
        };
        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                let filteredAttributes = filterAttributesKey(attributes, "borrower");
                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents = await event_repository_1.default.findByWalletAddressAndType(borrowerAddress, constants_1.EVENT_TYPE.ORCHAI);
                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, borrowerAddress);
                    let threshold = Number(event.params?.get("capacityThreshold") || "0");
                    if (threshold > 0 &&
                        Number(borrowerInfo.capacity) >= threshold) {
                        telegram_1.TelegramBot.sendMessage(event.chatId, message_creation_1.default.capacityThresholdAlert(borrowerInfo, threshold));
                    }
                }
            }
        };
    }
    EventListener.borrowLeverageStableListener = borrowLeverageStableListener;
    function borrowStableListener(cosmwasmClient) {
        let webSocketClient = new websocket_1.w3cwebsocket(WS_RPC_ORAI + "/websocket");
        webSocketClient.onopen = () => {
            webSocketClient.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "subscribe",
                id: idCounter.toString(),
                params: {
                    query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_MONEY_MARKET}' AND wasm.action='borrow_stable'`,
                },
            }));
        };
        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                let filteredAttributes = filterAttributesKey(attributes, "borrower");
                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents = await event_repository_1.default.findByWalletAddressAndType(borrowerAddress, constants_1.EVENT_TYPE.ORCHAI);
                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, borrowerAddress);
                    let threshold = Number(event.params?.get("capacityThreshold") || "0");
                    if (threshold > 0 &&
                        Number(borrowerInfo.capacity) >= threshold) {
                        telegram_1.TelegramBot.sendMessage(event.chatId, message_creation_1.default.capacityThresholdAlert(borrowerInfo, threshold));
                    }
                }
            }
        };
    }
    EventListener.borrowStableListener = borrowStableListener;
    function withdrawCollateralListener(cosmwasmClient, collateralCustodyAddress) {
        let webSocketClient = new websocket_1.w3cwebsocket(WS_RPC_ORAI + "/websocket");
        webSocketClient.onopen = () => {
            webSocketClient.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "subscribe",
                id: idCounter.toString(),
                params: {
                    query: `tm.event='Tx' AND wasm._contract_address='${collateralCustodyAddress}' AND wasm.action='withdraw_collateral'`,
                },
            }));
        };
        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                let filteredAttributes = filterAttributesKey(attributes, "borrower");
                let borrowerAddress = base64ToText(filteredAttributes[0].value);
                let orchaiEvents = await event_repository_1.default.findByWalletAddressAndType(borrowerAddress, constants_1.EVENT_TYPE.ORCHAI);
                for (let i = 0; i < orchaiEvents.length; i++) {
                    let event = orchaiEvents[i];
                    let borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, borrowerAddress);
                    let threshold = Number(event.params?.get("capacityThreshold") || "0");
                    if (threshold > 0 &&
                        Number(borrowerInfo.capacity) >= threshold) {
                        telegram_1.TelegramBot.sendMessage(event.chatId, message_creation_1.default.capacityThresholdAlert(borrowerInfo, threshold));
                    }
                }
            }
        };
    }
    EventListener.withdrawCollateralListener = withdrawCollateralListener;
    function submitOrderListener(cosmwasmClient) {
        let webSocketClient = new websocket_1.w3cwebsocket(WS_RPC_ORAI + "/websocket");
        webSocketClient.onopen = () => {
            webSocketClient.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "subscribe",
                id: idCounter.toString(),
                params: {
                    query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_ORAISWAP_LIMIT_ORDER}' AND wasm.action='submit_order'`,
                },
            }));
        };
        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                for (let i = 0; i < attributes.length; i++) {
                    if (base64ToText(attributes[i].value) ==
                        ADDRESS_ORAISWAP_LIMIT_ORDER &&
                        base64ToText(attributes[i + 1].value) == "submit_order") {
                        let order = {};
                        for (let j = 0; j <= 8; j++) {
                            order[base64ToText(attributes[i + j].key)] =
                                base64ToText(attributes[i + j].value);
                        }
                        let message = "";
                        let offerAmount = Number(order["offer_asset"].split(" ")[0]);
                        let askAmount = Number(order["ask_asset"].split(" ")[0]);
                        if (order["direction"] == "Sell") {
                            message = message_creation_1.default.orderSubmitted(order["order_id"], order["direction"], offerAmount.toString(), (askAmount / offerAmount).toFixed(4));
                        }
                        else {
                            message = message_creation_1.default.orderSubmitted(order["order_id"], order["direction"], askAmount.toString(), (offerAmount / askAmount).toFixed(4));
                        }
                        let oraiDexEvents = await event_repository_1.default.findByWalletAddressAndType(order["bidder_addr"], constants_1.EVENT_TYPE.ORAI_DEX);
                        for (let j = 0; j < oraiDexEvents.length; j++) {
                            let event = oraiDexEvents[j];
                            telegram_1.TelegramBot.sendMessage(event.chatId, message);
                        }
                        i += 8;
                        // console.log(message);
                    }
                }
            }
        };
    }
    EventListener.submitOrderListener = submitOrderListener;
    function cancelOrderListener(cosmwasmClient) {
        let webSocketClient = new websocket_1.w3cwebsocket(WS_RPC_ORAI + "/websocket");
        webSocketClient.onopen = () => {
            webSocketClient.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "subscribe",
                id: idCounter.toString(),
                params: {
                    query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_ORAISWAP_LIMIT_ORDER}' AND wasm.action='cancel_order'`,
                },
            }));
        };
        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm");
                for (let i = 0; i < attributes.length; i++) {
                    if (base64ToText(attributes[i].value) ==
                        ADDRESS_ORAISWAP_LIMIT_ORDER &&
                        base64ToText(attributes[i + 1].value) == "cancel_order") {
                        let order = {};
                        let next = 0;
                        for (let j = 0; j <= 6; j++) {
                            order[base64ToText(attributes[i + j].key)] =
                                base64ToText(attributes[i + j].value);
                        }
                        let message = "";
                        if (order["bidder_refund"].includes(ADDRESS_USDT)) {
                            // MessageCreation.orderCancelled(order["order_id"]);
                            next = 11;
                            let amount = order["bidder_refund"].replace(ADDRESS_USDT, "");
                            message = message_creation_1.default.orderCancelled(order["order_id"], amount, "USDT");
                        }
                        else {
                            next = 6;
                            let amount = order["bidder_refund"].replace("orai", "");
                            message = message_creation_1.default.orderCancelled(order["order_id"], amount, "ORAI");
                        }
                        let oraiDexEvents = await event_repository_1.default.findByWalletAddressAndType(order["bidder_addr"], constants_1.EVENT_TYPE.ORAI_DEX);
                        for (let j = 0; j < oraiDexEvents.length; j++) {
                            let event = oraiDexEvents[j];
                            telegram_1.TelegramBot.sendMessage(event.chatId, message);
                        }
                        i += next;
                        // console.log(message);
                    }
                }
            }
        };
    }
    EventListener.cancelOrderListener = cancelOrderListener;
    function executeOrderbookPairListener(cosmwasmClient) {
        let webSocketClient = new websocket_1.w3cwebsocket(WS_RPC_ORAI + "/websocket");
        webSocketClient.onopen = () => {
            webSocketClient.send(JSON.stringify({
                jsonrpc: "2.0",
                method: "subscribe",
                id: idCounter.toString(),
                params: {
                    query: `tm.event='Tx' AND wasm._contract_address='${ADDRESS_ORAISWAP_LIMIT_ORDER}' ` +
                        `AND wasm.action='execute_orderbook_pair' ` +
                        `AND wasm-matched_order._contract_address='${ADDRESS_ORAISWAP_LIMIT_ORDER}'`,
                },
            }));
        };
        idCounter += 1;
        webSocketClient.onmessage = async (message) => {
            let data = message.data;
            let dataObj = JSON.parse(data);
            let result = dataObj.result;
            if (!isEmpty(result)) {
                let transaction = result.data.value.TxResult;
                let events = transaction.result.events;
                let attributes = filterEvents(events, "wasm-matched_order");
                let next = 10;
                let fulfilledOrders = [];
                // console.log(attributes.length);
                for (let i = 0; i < attributes.length; i += next) {
                    // console.log(i);
                    let status = base64ToText(attributes[i + 1].value);
                    // console.log(status);
                    if (status == "Fulfilled") {
                        fulfilledOrders.push({
                            bidderAddr: base64ToText(attributes[i + 2].value),
                            orderID: base64ToText(attributes[i + 3].value),
                            direction: base64ToText(attributes[i + 4].value),
                            offerAmount: base64ToText(attributes[i + 5].value),
                            filledOfferAmount: base64ToText(attributes[i + 6].value),
                            askAmount: base64ToText(attributes[i + 7].value),
                            filledAskAmount: base64ToText(attributes[i + 8].value),
                        });
                    }
                }
                // console.log(fulfilledOrders);
                for (let i = 0; i < fulfilledOrders.length; i++) {
                    let order = fulfilledOrders[i];
                    let message = "";
                    if (order.direction == "Sell") {
                        message = message_creation_1.default.orderFulfilled(order.orderID, "sold", order.offerAmount, (Number(order.askAmount) /
                            Number(order.offerAmount)).toFixed(4));
                    }
                    else {
                        message = message_creation_1.default.orderFulfilled(order.orderID, "bought", order.askAmount, (Number(order.offerAmount) /
                            Number(order.askAmount)).toFixed(4));
                    }
                    // console.log(message);
                    let walletAddress = order.bidderAddr;
                    let oraiDexEvents = await event_repository_1.default.findByWalletAddressAndType(walletAddress, constants_1.EVENT_TYPE.ORAI_DEX);
                    for (let i = 0; i < oraiDexEvents.length; i++) {
                        let event = oraiDexEvents[i];
                        telegram_1.TelegramBot.sendMessage(event.chatId, message);
                    }
                }
            }
        };
    }
    EventListener.executeOrderbookPairListener = executeOrderbookPairListener;
})(EventListener || (EventListener = {}));
exports.default = EventListener;
function isEmpty(object) {
    return Object.keys(object).length === 0;
}
function filterEvents(events, requiredType) {
    let result = [];
    for (let i = 0; i < events.length; i++) {
        if (events[i].type == requiredType) {
            result = result.concat(events[i].attributes);
        }
    }
    return result;
}
function filterAttributesKey(attributes, requiredKey) {
    let result = [];
    for (let i = 0; i < attributes.length; i++) {
        if (base64ToText(attributes[i].key) == requiredKey) {
            result = result.concat(attributes[i]);
        }
    }
    return result;
}
function base64ToText(base64) {
    return (0, cosmwasm_1.fromUtf8)((0, cosmwasm_1.fromBase64)(base64));
}
