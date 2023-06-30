"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
const orai_oracle_1 = __importDefault(require("./orai-oracle"));
const utils_1 = __importDefault(require("../utils"));
const { ADDRESS_MONEY_MARKET, ADDRESS_OVERSEER, ADDRESS_USDT, ADDRESS_AUSDT, ADDRESS_SORAI, ADDRESS_SCORAI, ADDRESS_STATOM, ADDRESS_STOSMO, ADDRESS_SORAI_CUSTODY, ADDRESS_SCORAI_CUSTODY, ADDRESS_STATOM_CUSTODY, ADDRESS_STOSMO_CUSTODY, ADDRESS_INTEREST_MODEL, BLOCK_PER_YEAR, } = process.env;
var OrchaiLending;
(function (OrchaiLending) {
    function getCw20Denom(address) {
        if (address == ADDRESS_SORAI) {
            return "sOrai";
        }
        else if (address == ADDRESS_SCORAI) {
            return "scOrai";
        }
        else if (address == ADDRESS_STATOM) {
            return "stAtom";
        }
        else if (address == ADDRESS_STOSMO) {
            return "stOsmo";
        }
        return "nothing";
    }
    async function queryConfig(client) {
        const queryMsg = {
            config: {},
        };
        return await _1.default.queryContractSmart(client, ADDRESS_MONEY_MARKET, queryMsg);
    }
    OrchaiLending.queryConfig = queryConfig;
    async function queryState(client) {
        const queryMsg = {
            state: {},
        };
        return await _1.default.queryContractSmart(client, ADDRESS_MONEY_MARKET, queryMsg);
    }
    OrchaiLending.queryState = queryState;
    async function queryBorrowerInfo(client, borrower) {
        let borrowerInfo = await _1.default.queryContractSmart(client, ADDRESS_MONEY_MARKET, {
            borrower_info: {
                borrower: borrower,
            },
        });
        let ausdtBalance = (await _1.default.queryContractSmart(client, ADDRESS_AUSDT, {
            balance: {
                address: borrower,
            },
        }))["balance"];
        let moneyMarketState = await queryState(client);
        let exchangeRate = Number(moneyMarketState["prev_exchange_rate"]);
        let totalLend = utils_1.default.fixNumber((Number(ausdtBalance) * exchangeRate) / 10 ** 6, 4);
        let collateralsInfoRaw = (await _1.default.queryContractSmart(client, ADDRESS_OVERSEER, {
            collaterals: {
                borrower: borrower,
            },
        }))["collaterals"];
        let collateralsInfo = new Array();
        let totalCollateralsValue = 0;
        for (let i = 0; i < collateralsInfoRaw.length; i++) {
            let info = collateralsInfoRaw[i];
            let price = (await orai_oracle_1.default.queryCw20Price(client, info[0]))["rate"];
            price = utils_1.default.fixNumber(Number(price), 4);
            let amount = utils_1.default.fixNumber(Number(info[1]) / 10 ** 6, 4);
            let value = amount * price;
            collateralsInfo.push({
                denom: getCw20Denom(info[0]),
                amount: amount,
                price: price,
                value: utils_1.default.fixNumber(value, 4),
            });
            totalCollateralsValue += value;
        }
        let borrowLimit = (await _1.default.queryContractSmart(client, ADDRESS_OVERSEER, {
            borrow_limit: {
                borrower: borrower,
            },
        }))["borrow_limit"];
        return {
            collaterals: collateralsInfo,
            totalCollateralsValue: utils_1.default.fixNumber(totalCollateralsValue, 4) || 0,
            totalLend: totalLend || 0,
            borrowLimit: utils_1.default.fixNumber(Number(borrowLimit) / 10 ** 6, 4) || 0,
            loanAmount: utils_1.default.fixNumber(Number(borrowerInfo["loan_amount"]) / 10 ** 6, 4) || 0,
            capacity: utils_1.default.fixNumber((Number(borrowerInfo["loan_amount"]) * 100) /
                Number(borrowLimit), 2) || 0,
        };
    }
    OrchaiLending.queryBorrowerInfo = queryBorrowerInfo;
    async function queryMarketInfo(client) {
        let usdtBalance = (await _1.default.queryContractSmart(client, ADDRESS_USDT, {
            balance: {
                address: ADDRESS_MONEY_MARKET,
            },
        }))["balance"];
        let usdtPrice = (await orai_oracle_1.default.queryCw20Price(client, ADDRESS_USDT))["rate"];
        let marketState = await _1.default.queryContractSmart(client, ADDRESS_MONEY_MARKET, {
            state: {},
        });
        let marketConfig = await _1.default.queryContractSmart(client, ADDRESS_MONEY_MARKET, {
            config: {},
        });
        let collateralsInfo = await queryCollateralsInfo(client);
        let borrowRate = (await _1.default.queryContractSmart(client, ADDRESS_INTEREST_MODEL, {
            borrow_rate: {
                market_balance: usdtBalance,
                total_liabilities: marketState["total_liabilities"],
                total_reserves: marketState["total_reserves"],
            },
        }))["rate"];
        // console.log(marketState);
        // console.log(marketConfig);
        let totalBorrow = utils_1.default.fixNumber(Number(marketState["total_liabilities"]) / 10 ** 6, 4);
        let totalDeposit = utils_1.default.fixNumber((Number(marketState["prev_astable_supply"]) *
            Number(marketState["prev_exchange_rate"])) /
            10 ** 6, 4);
        let reservesFactor = Number(marketConfig["reserves_factor"]);
        let totalCollateralValue = collateralsInfo["sOrai"]["totalCollateralValue"] +
            collateralsInfo["scOrai"]["totalCollateralValue"] +
            collateralsInfo["stAtom"]["totalCollateralValue"] +
            collateralsInfo["stOsmo"]["totalCollateralValue"];
        let totalValueLocked = totalDeposit + totalCollateralValue;
        let borrowAPR = Number(BLOCK_PER_YEAR) * Number(borrowRate) * 100;
        let lendAPR = (borrowAPR * totalBorrow * (1 - reservesFactor)) / totalDeposit;
        return {
            totalValueLocked: totalValueLocked || 0,
            totalLend: totalDeposit || 0,
            totalBorrow: totalBorrow || 0,
            utilizationRate: utils_1.default.fixNumber((totalBorrow * 100) / totalDeposit, 2) || 0,
            borrowAPR: utils_1.default.fixNumber(borrowAPR, 2) || 0,
            lendAPR: utils_1.default.fixNumber(lendAPR, 2) || 0,
            borrowAPY: utils_1.default.fixNumber(utils_1.default.aprToApy(Number(borrowAPR)), 2) || 0,
            lendAPY: utils_1.default.fixNumber(utils_1.default.aprToApy(Number(lendAPR)), 2) || 0,
            collateralsInfo: collateralsInfo,
        };
    }
    OrchaiLending.queryMarketInfo = queryMarketInfo;
    async function queryCollateralsInfo(client) {
        let sOraiBalance = (await _1.default.queryContractSmart(client, ADDRESS_SORAI, {
            balance: {
                address: ADDRESS_SORAI_CUSTODY,
            },
        }))["balance"];
        let sOraiPrice = (await orai_oracle_1.default.queryCw20Price(client, ADDRESS_SORAI))["rate"];
        let scOraiBalance = (await _1.default.queryContractSmart(client, ADDRESS_SCORAI, {
            balance: {
                address: ADDRESS_SCORAI_CUSTODY,
            },
        }))["balance"];
        let scOraiPrice = (await orai_oracle_1.default.queryCw20Price(client, ADDRESS_SCORAI))["rate"];
        let stAtomBalance = (await _1.default.queryContractSmart(client, ADDRESS_STATOM, {
            balance: {
                address: ADDRESS_STATOM_CUSTODY,
            },
        }))["balance"];
        let stAtomPrice = (await orai_oracle_1.default.queryCw20Price(client, ADDRESS_STATOM))["rate"];
        let stOsmoBalance = (await _1.default.queryContractSmart(client, ADDRESS_STOSMO, {
            balance: {
                address: ADDRESS_STOSMO_CUSTODY,
            },
        }))["balance"];
        let stOsmoPrice = (await orai_oracle_1.default.queryCw20Price(client, ADDRESS_STOSMO))["rate"];
        return {
            sOrai: {
                price: utils_1.default.fixNumber(Number(sOraiPrice), 4),
                totalCollateral: utils_1.default.fixNumber(Number(sOraiBalance) / 10 ** 6, 4),
                totalCollateralValue: utils_1.default.fixNumber((Number(sOraiPrice) * Number(sOraiBalance)) / 10 ** 6, 4),
            },
            scOrai: {
                price: utils_1.default.fixNumber(Number(scOraiPrice), 4),
                totalCollateral: utils_1.default.fixNumber(Number(scOraiBalance) / 10 ** 6, 4),
                totalCollateralValue: utils_1.default.fixNumber((Number(scOraiPrice) * Number(scOraiBalance)) / 10 ** 6, 4),
            },
            stAtom: {
                price: utils_1.default.fixNumber(Number(stAtomPrice), 4),
                totalCollateral: utils_1.default.fixNumber(Number(stAtomBalance) / 10 ** 6, 4),
                totalCollateralValue: utils_1.default.fixNumber((Number(stAtomPrice) * Number(stAtomBalance)) / 10 ** 6, 4),
            },
            stOsmo: {
                price: utils_1.default.fixNumber(Number(stOsmoPrice), 4),
                totalCollateral: utils_1.default.fixNumber(Number(stOsmoBalance) / 10 ** 6, 4),
                totalCollateralValue: utils_1.default.fixNumber((Number(stOsmoPrice) * Number(stOsmoBalance)) / 10 ** 6, 4),
            },
        };
    }
    OrchaiLending.queryCollateralsInfo = queryCollateralsInfo;
})(OrchaiLending || (OrchaiLending = {}));
exports.default = OrchaiLending;
