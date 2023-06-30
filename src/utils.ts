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

    export function aprToApy(apr: number) {
        let t = 31536000;
        let bs = 5.8;
        let b = t / bs;
        let apy = (1 + apr / 100 / b) ** b - 1;
        return apy * 100;
    }
}

export default Utils;
