import Utils from "../utils";
namespace MessageCreation {
    export function orchaiInfo(marketInfo: any) {
        let message =
            "*Orchai Money Market*\n" +
            `Total Lend: ${Utils.stringifyNumberToUSD(
                marketInfo.totalLend
            )}\n` +
            `Total Borrow: ${Utils.stringifyNumberToUSD(
                marketInfo.totalBorrow
            )}\n` +
            `Lend APY: ${marketInfo.lendAPY}%\n` +
            `Borrow APY:${marketInfo.borrowAPY}%\n` +
            "\n";
        return escapeMessage(message);
    }

    export function borrowerInfo(
        walletAddress: string,
        borrowerInfo: any,
        netAPY: string
    ) {
        let message =
            `*Your wallet address*: \`${walletAddress}\`\n` +
            `Lend: ${Utils.stringifyNumberToUSD(borrowerInfo.totalLend)}\n` +
            `Borrow: ${Utils.stringifyNumberToUSD(borrowerInfo.loanAmount)}\n` +
            `Borrow limit: ${Utils.stringifyNumberToUSD(
                borrowerInfo.borrowLimit
            )}\n` +
            `Borrow capacity: ${borrowerInfo.capacity}%\n` +
            `Net APY: ${netAPY}%\n`;
        return escapeMessage(message);
    }

    export function liquidationAlert(borrowerInfo: any) {
        let message =
            "*Orchai Money Market: Warning!*\n\n" +
            `You have been liquidated\n` +
            `Here's your current wallet status:\n` +
            `Borrow limit: ${Utils.stringifyNumberToUSD(
                borrowerInfo.borrowLimit
            )}\n` +
            `Borrow: ${Utils.stringifyNumberToUSD(borrowerInfo.loanAmount)}\n` +
            `Borrow capacity: ${borrowerInfo.capacity}%\n`;
        return escapeMessage(message);
    }

    export function capacityThresholdAlert(
        borrowerInfo: any,
        capacityThreshold: any
    ) {
        let message =
            "*Orchai Money Market: Warning!*\n\n" +
            `Your account has reached the warning threshold, currently set at ${capacityThreshold}%\n` +
            `Here's your current wallet status:\n` +
            `Borrow limit: ${Utils.stringifyNumberToUSD(
                borrowerInfo.borrowLimit
            )}\n` +
            `Borrow: ${Utils.stringifyNumberToUSD(borrowerInfo.loanAmount)}\n` +
            `Borrow capacity: ${borrowerInfo.capacity}%\n`;
        return escapeMessage(message);
    }

    export function orderSubmitted(
        orderId: string,
        direction: string,
        amount: string,
        price: string
    ) {
        let message =
            `*OraiDEX OrderBook: Order Submission*\n` +
            `Your wallet has submitted an order with ID ${orderId}: ${direction} ${Utils.stringifyNumber(
                Number(amount) / 10 ** 6
            )} ORAI at a price of ${price} USDT/ORAI`;
        return escapeMessage(message);
    }

    export function orderCancelled(
        orderId: string,
        amount: string,
        asset: string
    ) {
        let message =
            `*OraiDEX OrderBook: Order Cancellation*\n` +
            `Your wallet has cancelled an order with ID ${orderId}.\n` +
            `You have been refunded ${Utils.stringifyNumber(
                Number(amount) / 10 ** 6
            )} ${asset.toUpperCase()}.`;
        return escapeMessage(message);
    }

    export function orderFulfilled(
        orderId: string,
        direction: string,
        amount: string,
        price: string
    ) {
        let message =
            `*OraiDEX OrderBook: Order Fulfilled*\n` +
            `Your orderbook pair with ID ${orderId} has been fulfilled.\n` +
            `You have successfully ${direction} ${Utils.stringifyNumber(
                Number(amount) / 10 ** 6
            )} ORAI at a price of ${price} USDT/ORAI`;
        return escapeMessage(message);
    }

    export function removeJsonCurlyBracket(json: string) {
        return json.substring(1, json.length - 1);
    }

    export function escapeMessage(msg: string) {
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
}

export default MessageCreation;
