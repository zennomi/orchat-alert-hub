"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __importDefault(require("../utils"));
var MessageCreation;
(function (MessageCreation) {
    function orchaiInfo(marketInfo) {
        let message = "*Orchai Money Market*\n" +
            `Total Lend: ${utils_1.default.stringifyNumberToUSD(marketInfo.totalLend)}\n` +
            `Total Borrow: ${utils_1.default.stringifyNumberToUSD(marketInfo.totalBorrow)}\n` +
            `Lend APY: ${marketInfo.lendAPY}%\n` +
            `Borrow APY:${marketInfo.borrowAPY}%\n` +
            "\n";
        return escapeMessage(message);
    }
    MessageCreation.orchaiInfo = orchaiInfo;
    function borrowerInfo(walletAddress, borrowerInfo, netAPY) {
        let message = `*Your wallet address*: \`${walletAddress}\`\n` +
            `Lend: ${utils_1.default.stringifyNumberToUSD(borrowerInfo.totalLend)}\n` +
            `Borrow: ${utils_1.default.stringifyNumberToUSD(borrowerInfo.loanAmount)}\n` +
            `Borrow limit: ${utils_1.default.stringifyNumberToUSD(borrowerInfo.borrowLimit)}\n` +
            `Borrow capacity: ${borrowerInfo.capacity}%\n` +
            `Net APY: ${netAPY}%\n`;
        return escapeMessage(message);
    }
    MessageCreation.borrowerInfo = borrowerInfo;
    function liquidationAlert(borrowerInfo) {
        let message = "*Orchai Money Market: Warning!*\n\n" +
            `You have been liquidated\n` +
            `Here's your current wallet status:\n` +
            `Borrow limit: ${utils_1.default.stringifyNumberToUSD(borrowerInfo.borrowLimit)}\n` +
            `Borrow: ${utils_1.default.stringifyNumberToUSD(borrowerInfo.loanAmount)}\n` +
            `Borrow capacity: ${borrowerInfo.capacity}%\n`;
        return escapeMessage(message);
    }
    MessageCreation.liquidationAlert = liquidationAlert;
    function capacityThresholdAlert(borrowerInfo, capacityThreshold) {
        let message = "*Orchai Money Market: Warning!*\n\n" +
            `Your account has reached the warning threshold, currently set at ${capacityThreshold}%\n` +
            `Here's your current wallet status:\n` +
            `Borrow limit: ${utils_1.default.stringifyNumberToUSD(borrowerInfo.borrowLimit)}\n` +
            `Borrow: ${utils_1.default.stringifyNumberToUSD(borrowerInfo.loanAmount)}\n` +
            `Borrow capacity: ${borrowerInfo.capacity}%\n`;
        return escapeMessage(message);
    }
    MessageCreation.capacityThresholdAlert = capacityThresholdAlert;
    function orderSubmitted(orderId, direction, amount, price) {
        let message = `*OraiDEX OrderBook: Order Submission*\n` +
            `Your wallet has submitted an order with ID ${orderId}: ${direction} ${utils_1.default.stringifyNumber(Number(amount) / 10 ** 6)} ORAI at a price of ${price} USDT/ORAI`;
        return escapeMessage(message);
    }
    MessageCreation.orderSubmitted = orderSubmitted;
    function orderCancelled(orderId, amount, asset) {
        let message = `*OraiDEX OrderBook: Order Cancellation*\n` +
            `Your wallet has cancelled an order with ID ${orderId}.\n` +
            `You have been refunded ${utils_1.default.stringifyNumber(Number(amount) / 10 ** 6)} ${asset.toUpperCase()}.`;
        return escapeMessage(message);
    }
    MessageCreation.orderCancelled = orderCancelled;
    function orderFulfilled(orderId, direction, amount, price) {
        let message = `*OraiDEX OrderBook: Order Fulfilled*\n` +
            `Your orderbook pair with ID ${orderId} has been fulfilled.\n` +
            `You have successfully ${direction} ${utils_1.default.stringifyNumber(Number(amount) / 10 ** 6)} ORAI at a price of ${price} USDT/ORAI`;
        return escapeMessage(message);
    }
    MessageCreation.orderFulfilled = orderFulfilled;
    function removeJsonCurlyBracket(json) {
        return json.substring(1, json.length - 1);
    }
    MessageCreation.removeJsonCurlyBracket = removeJsonCurlyBracket;
    function escapeMessage(msg) {
        return msg
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/\(/g, "\\(")
            .replace(/\)/g, "\\)")
            .replace(/\~/g, "\\~")
            .replace(/\>/g, "\\>")
            .replace(/\#/g, "\\#")
            .replace(/\+/g, "\\+")
            .replace(/\-/g, "\\-")
            .replace(/\=/g, "\\=")
            .replace(/\|/g, "\\|")
            .replace(/\{/g, "\\{")
            .replace(/\}/g, "\\}")
            .replace(/\./g, "\\.")
            .replace(/\!/g, "\\!");
    }
    MessageCreation.escapeMessage = escapeMessage;
})(MessageCreation || (MessageCreation = {}));
exports.default = MessageCreation;
