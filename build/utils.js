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
})(Utils || (Utils = {}));
exports.default = Utils;
