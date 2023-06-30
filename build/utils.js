"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils;
(function (Utils) {
    function fixNumber(value, digit) {
        return Math.round(value * 10 ** digit) / 10 ** digit;
    }
    Utils.fixNumber = fixNumber;
    function stringifyNumberToUSD(value) {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });
        return formatter.format(Number(value));
    }
    Utils.stringifyNumberToUSD = stringifyNumberToUSD;
    function stringifyNumber(value) {
        return Number(value).toLocaleString("en-US", {
            minimumFractionDigits: 4,
        });
    }
    Utils.stringifyNumber = stringifyNumber;
    function aprToApy(apr) {
        let t = 31536000;
        let bs = 5.8;
        let b = t / bs;
        let apy = (1 + apr / 100 / b) ** b - 1;
        return apy * 100;
    }
    Utils.aprToApy = aprToApy;
})(Utils || (Utils = {}));
exports.default = Utils;
