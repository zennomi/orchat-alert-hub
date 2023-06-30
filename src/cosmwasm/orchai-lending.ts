import { CosmWasmClient } from "cosmwasm";
import CosmWasm, { JsonObject } from ".";
import OraiOracle from "./orai-oracle";
import Utils from "../utils";
const {
    ADDRESS_MONEY_MARKET,
    ADDRESS_OVERSEER,
    ADDRESS_USDT,
    ADDRESS_AUSDT,
    ADDRESS_SORAI,
    ADDRESS_SCORAI,
    ADDRESS_STATOM,
    ADDRESS_STOSMO,
    ADDRESS_SORAI_CUSTODY,
    ADDRESS_SCORAI_CUSTODY,
    ADDRESS_STATOM_CUSTODY,
    ADDRESS_STOSMO_CUSTODY,
    ADDRESS_INTEREST_MODEL,
    BLOCK_PER_YEAR,
} = process.env;

namespace OrchaiLending {
    function getCw20Denom(address: string) {
        if (address == ADDRESS_SORAI) {
            return "sOrai";
        } else if (address == ADDRESS_SCORAI) {
            return "scOrai";
        } else if (address == ADDRESS_STATOM) {
            return "stAtom";
        } else if (address == ADDRESS_STOSMO) {
            return "stOsmo";
        }
        return "nothing";
    }
    export async function queryConfig(
        client: CosmWasmClient
    ): Promise<JsonObject> {
        const queryMsg = {
            config: {},
        };
        return await CosmWasm.queryContractSmart(
            client,
            ADDRESS_MONEY_MARKET as string,
            queryMsg
        );
    }

    export async function queryState(
        client: CosmWasmClient
    ): Promise<JsonObject> {
        const queryMsg = {
            state: {},
        };
        return await CosmWasm.queryContractSmart(
            client,
            ADDRESS_MONEY_MARKET as string,
            queryMsg
        );
    }

    export async function queryBorrowerInfo(
        client: CosmWasmClient,
        borrower: string
    ) {
        let borrowerInfo = await CosmWasm.queryContractSmart(
            client,
            ADDRESS_MONEY_MARKET as string,
            {
                borrower_info: {
                    borrower: borrower,
                },
            }
        );

        let ausdtBalance = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_AUSDT as string,
                {
                    balance: {
                        address: borrower,
                    },
                }
            )) as any
        )["balance"];

        let moneyMarketState = await queryState(client);
        let exchangeRate = Number(moneyMarketState["prev_exchange_rate"]);
        let totalLend = Utils.fixNumber(
            (Number(ausdtBalance) * exchangeRate) / 10 ** 6,
            4
        );

        let collateralsInfoRaw: [] = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_OVERSEER as string,
                {
                    collaterals: {
                        borrower: borrower,
                    },
                }
            )) as any
        )["collaterals"];

        let collateralsInfo = new Array();
        let totalCollateralsValue = 0;
        for (let i = 0; i < collateralsInfoRaw.length; i++) {
            let info = collateralsInfoRaw[i];
            let price = (
                (await OraiOracle.queryCw20Price(
                    client,
                    info[0] as string
                )) as any
            )["rate"];
            price = Utils.fixNumber(Number(price), 4);
            let amount = Utils.fixNumber(Number(info[1]) / 10 ** 6, 4);
            let value = amount * price;
            collateralsInfo.push({
                denom: getCw20Denom(info[0]),
                amount: amount,
                price: price,
                value: Utils.fixNumber(value, 4),
            });
            totalCollateralsValue += value;
        }

        let borrowLimit = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_OVERSEER as string,
                {
                    borrow_limit: {
                        borrower: borrower,
                    },
                }
            )) as any
        )["borrow_limit"];

        return {
            collaterals: collateralsInfo,
            totalCollateralsValue:
                Utils.fixNumber(totalCollateralsValue, 4) || 0,
            totalLend: totalLend || 0,
            borrowLimit: Utils.fixNumber(Number(borrowLimit) / 10 ** 6, 4) || 0,
            loanAmount:
                Utils.fixNumber(
                    Number(borrowerInfo["loan_amount"]) / 10 ** 6,
                    4
                ) || 0,
            capacity:
                Utils.fixNumber(
                    (Number(borrowerInfo["loan_amount"]) * 100) /
                        Number(borrowLimit),
                    2
                ) || 0,
        };
    }

    export async function queryMarketInfo(client: CosmWasmClient) {
        let usdtBalance = (
            (await CosmWasm.queryContractSmart(client, ADDRESS_USDT as string, {
                balance: {
                    address: ADDRESS_MONEY_MARKET as string,
                },
            })) as any
        )["balance"];
        let usdtPrice = (
            (await OraiOracle.queryCw20Price(
                client,
                ADDRESS_USDT as string
            )) as any
        )["rate"];

        let marketState: any = await CosmWasm.queryContractSmart(
            client,
            ADDRESS_MONEY_MARKET as string,
            {
                state: {},
            }
        );

        let marketConfig: any = await CosmWasm.queryContractSmart(
            client,
            ADDRESS_MONEY_MARKET as string,
            {
                config: {},
            }
        );

        let collateralsInfo = await queryCollateralsInfo(client);

        let borrowRate = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_INTEREST_MODEL as string,
                {
                    borrow_rate: {
                        market_balance: usdtBalance,
                        total_liabilities: marketState["total_liabilities"],
                        total_reserves: marketState["total_reserves"],
                    },
                }
            )) as any
        )["rate"];

        // console.log(marketState);
        // console.log(marketConfig);
        let totalBorrow = Utils.fixNumber(
            Number(marketState["total_liabilities"]) / 10 ** 6,
            4
        );
        let totalDeposit = Utils.fixNumber(
            (Number(marketState["prev_astable_supply"]) *
                Number(marketState["prev_exchange_rate"])) /
                10 ** 6,
            4
        );
        let reservesFactor = Number(marketConfig["reserves_factor"]);
        let totalCollateralValue =
            collateralsInfo["sOrai"]["totalCollateralValue"] +
            collateralsInfo["scOrai"]["totalCollateralValue"] +
            collateralsInfo["stAtom"]["totalCollateralValue"] +
            collateralsInfo["stOsmo"]["totalCollateralValue"];
        let totalValueLocked = totalDeposit + totalCollateralValue;
        let borrowAPR = Number(BLOCK_PER_YEAR) * Number(borrowRate) * 100;
        let lendAPR =
            (borrowAPR * totalBorrow * (1 - reservesFactor)) / totalDeposit;

        return {
            totalValueLocked: totalValueLocked || 0,
            totalLend: totalDeposit || 0,
            totalBorrow: totalBorrow || 0,
            utilizationRate:
                Utils.fixNumber((totalBorrow * 100) / totalDeposit, 2) || 0,
            borrowAPR: Utils.fixNumber(borrowAPR, 2) || 0,
            lendAPR: Utils.fixNumber(lendAPR, 2) || 0,
            borrowAPY:
                Utils.fixNumber(Utils.aprToApy(Number(borrowAPR)), 2) || 0,
            lendAPY: Utils.fixNumber(Utils.aprToApy(Number(lendAPR)), 2) || 0,
            collateralsInfo: collateralsInfo,
        };
    }

    export async function queryCollateralsInfo(client: CosmWasmClient) {
        let sOraiBalance = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_SORAI as string,
                {
                    balance: {
                        address: ADDRESS_SORAI_CUSTODY as string,
                    },
                }
            )) as any
        )["balance"];
        let sOraiPrice = (
            (await OraiOracle.queryCw20Price(
                client,
                ADDRESS_SORAI as string
            )) as any
        )["rate"];
        let scOraiBalance = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_SCORAI as string,
                {
                    balance: {
                        address: ADDRESS_SCORAI_CUSTODY as string,
                    },
                }
            )) as any
        )["balance"];
        let scOraiPrice = (
            (await OraiOracle.queryCw20Price(
                client,
                ADDRESS_SCORAI as string
            )) as any
        )["rate"];
        let stAtomBalance = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_STATOM as string,
                {
                    balance: {
                        address: ADDRESS_STATOM_CUSTODY as string,
                    },
                }
            )) as any
        )["balance"];
        let stAtomPrice = (
            (await OraiOracle.queryCw20Price(
                client,
                ADDRESS_STATOM as string
            )) as any
        )["rate"];
        let stOsmoBalance = (
            (await CosmWasm.queryContractSmart(
                client,
                ADDRESS_STOSMO as string,
                {
                    balance: {
                        address: ADDRESS_STOSMO_CUSTODY as string,
                    },
                }
            )) as any
        )["balance"];
        let stOsmoPrice = (
            (await OraiOracle.queryCw20Price(
                client,
                ADDRESS_STOSMO as string
            )) as any
        )["rate"];

        return {
            sOrai: {
                price: Utils.fixNumber(Number(sOraiPrice), 4),
                totalCollateral: Utils.fixNumber(
                    Number(sOraiBalance) / 10 ** 6,
                    4
                ),
                totalCollateralValue: Utils.fixNumber(
                    (Number(sOraiPrice) * Number(sOraiBalance)) / 10 ** 6,
                    4
                ),
            },
            scOrai: {
                price: Utils.fixNumber(Number(scOraiPrice), 4),
                totalCollateral: Utils.fixNumber(
                    Number(scOraiBalance) / 10 ** 6,
                    4
                ),
                totalCollateralValue: Utils.fixNumber(
                    (Number(scOraiPrice) * Number(scOraiBalance)) / 10 ** 6,
                    4
                ),
            },
            stAtom: {
                price: Utils.fixNumber(Number(stAtomPrice), 4),
                totalCollateral: Utils.fixNumber(
                    Number(stAtomBalance) / 10 ** 6,
                    4
                ),
                totalCollateralValue: Utils.fixNumber(
                    (Number(stAtomPrice) * Number(stAtomBalance)) / 10 ** 6,
                    4
                ),
            },
            stOsmo: {
                price: Utils.fixNumber(Number(stOsmoPrice), 4),
                totalCollateral: Utils.fixNumber(
                    Number(stOsmoBalance) / 10 ** 6,
                    4
                ),
                totalCollateralValue: Utils.fixNumber(
                    (Number(stOsmoPrice) * Number(stOsmoBalance)) / 10 ** 6,
                    4
                ),
            },
        };
    }
}

export default OrchaiLending;


