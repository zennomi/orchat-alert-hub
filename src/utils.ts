namespace Utils {
    export function fixNumber(value: number, digit: number): number {
        return Math.round(value * 10 ** digit) / 10 ** digit;
    }

    export function stringifyNumberToUSD(value: number | string) {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });
        return formatter.format(Number(value));
    }

    export function stringifyNumber(value: number | string) {
        return Number(value).toLocaleString("en-US", {
            minimumFractionDigits: 4,
        });
    }
}

export default Utils;
