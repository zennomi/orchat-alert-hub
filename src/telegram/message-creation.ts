namespace MessageCreation {
    export function orchaiInfo(marketInfo: any) {
        return escapeMessage(
            "Orchai Lending Pool info: \n" +
                JSON.stringify(marketInfo, null, "\t")
        );
    }

    export function borrowerInfo(borrowerInfo: any) {
        return escapeMessage(
            "Your wallet info: \n" + JSON.stringify(borrowerInfo, null, "\t")
        );
    }

    export function liquidationAlert(borrowerInfo: any) {
        return escapeMessage(
            "You have been liquidated. Your wallet info: \n" +
                JSON.stringify(borrowerInfo, null, "\t")
        );
    }

    export function capacityThresholdAlert(borrowerInfo: any) {
        return escapeMessage(
            "You've reach capacity threshold. Your wallet info: \n" +
                JSON.stringify(borrowerInfo, null, "\t")
        );
    }

    export function removeJsonCurlyBracket(json: string) {
        return json.substring(1, json.length - 1);
    }

    export function escapeMessage(msg: string) {
        return msg
            .replace(/\_/g, "\\_")
            .replace(/\*/g, "\\*")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/\(/g, "\\(")
            .replace(/\)/g, "\\)")
            .replace(/\~/g, "\\~")
            .replace(/\`/g, "\\`")
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
