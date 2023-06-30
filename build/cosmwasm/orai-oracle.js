"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
const { ADDRESS_ORACLE, ADDRESS_USDT } = process.env;
var OraiOracle;
(function (OraiOracle) {
    async function queryCw20Price(client, tokenAddress) {
        const queryMsg = {
            price: {
                base: { token: { contract_addr: ADDRESS_USDT } },
                quote: {
                    token: {
                        contract_addr: tokenAddress,
                    },
                },
            },
        };
        return await _1.default.queryContractSmart(client, ADDRESS_ORACLE, queryMsg);
    }
    OraiOracle.queryCw20Price = queryCw20Price;
    async function queryCoinPrice(client, denom) {
        const queryMsg = {
            price: {
                base: { token: { contract_addr: ADDRESS_USDT } },
                quote: {
                    NativeToken: {
                        denom: denom,
                    },
                },
            },
        };
        return await _1.default.queryContractSmart(client, ADDRESS_ORACLE, queryMsg);
    }
    OraiOracle.queryCoinPrice = queryCoinPrice;
})(OraiOracle || (OraiOracle = {}));
exports.default = OraiOracle;
