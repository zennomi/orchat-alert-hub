import { CosmWasmClient } from "cosmwasm";
import CosmWasm, { JsonObject } from ".";
import OraiOracle from "./orai-oracle";
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
        let totalLend = fixNumber(Number(ausdtBalance) * exchangeRate);

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
            price = Number(price).toFixed(4);
            let amount = fixNumber(Number(info[1]));
            let value = amount * price;
            collateralsInfo.push({
                denom: getCw20Denom(info[0]),
                amount: amount,
                price: price,
                value: value.toFixed(4),
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
            totalCollateralsValue: totalCollateralsValue.toFixed(4),
            totalLend: totalLend,
            borrowLimit: fixNumber(Number(borrowLimit)),
            loanAmount: fixNumber(Number(borrowerInfo["loan_amount"])),
            capacity:
                (
                    (Number(borrowerInfo["loan_amount"]) * 100) /
                    Number(borrowLimit)
                ).toFixed(2) || 0,
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
        let totalBorrow = fixNumber(Number(marketState["total_liabilities"]));
        let totalDeposit = fixNumber(
            Number(marketState["prev_astable_supply"]) *
                Number(marketState["prev_exchange_rate"])
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
            totalValueLocked: totalValueLocked,
            totalLend: totalDeposit,
            totalBorrow: totalBorrow,
            utilizationRate: ((totalBorrow * 100) / totalDeposit).toFixed(2),
            borrowAPR: borrowAPR.toFixed(2),
            lendAPR: lendAPR.toFixed(2),
            borrowAPY: aprToApy(Number(borrowAPR)).toFixed(2),
            lendAPY: aprToApy(Number(lendAPR)).toFixed(2),
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
                price: Number(sOraiPrice).toFixed(4),
                totalCollateral: fixNumber(Number(sOraiBalance)),
                totalCollateralValue: fixNumber(
                    Number(sOraiPrice) * Number(sOraiBalance)
                ),
            },
            scOrai: {
                price: Number(scOraiPrice).toFixed(4),
                totalCollateral: fixNumber(Number(scOraiBalance)),
                totalCollateralValue: fixNumber(
                    Number(scOraiPrice) * Number(scOraiBalance)
                ),
            },
            stAtom: {
                price: Number(stAtomPrice).toFixed(4),
                totalCollateral: fixNumber(Number(stAtomBalance)),
                totalCollateralValue: fixNumber(
                    Number(stAtomPrice) * Number(stAtomBalance)
                ),
            },
            stOsmo: {
                price: Number(stOsmoPrice).toFixed(4),
                totalCollateral: fixNumber(Number(stOsmoBalance)),
                totalCollateralValue: fixNumber(
                    Number(stOsmoPrice) * Number(stOsmoBalance)
                ),
            },
        };
    }
}

export default OrchaiLending;

function fixNumber(value: number): number {
    return Number((value / 10 ** 6).toFixed(4));
}

function aprToApy(apr: number) {
    let t = 31536000;
    let bs = 5.8;
    let b = t / bs;
    let apy = (1 + apr / 100 / b) ** b - 1;
    return apy * 100;
}
