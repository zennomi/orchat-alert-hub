import { CosmWasmClient } from "cosmwasm";
import CosmWasm, { JsonObject } from ".";

const { ADDRESS_ORACLE, ADDRESS_USDT } = process.env;

namespace OraiOracle {
    export async function queryCw20Price(
        client: CosmWasmClient,
        tokenAddress: string
    ): Promise<JsonObject> {
        const queryMsg = {
            price: {
                base: { token: { contract_addr: ADDRESS_USDT as string } },
                quote: {
                    token: {
                        contract_addr: tokenAddress,
                    },
                },
            },
        };

        return await CosmWasm.queryContractSmart(
            client,
            ADDRESS_ORACLE as string,
            queryMsg
        );
    }

    export async function queryCoinPrice(
        client: CosmWasmClient,
        denom: string
    ) {
        const queryMsg = {
            price: {
                base: { token: { contract_addr: ADDRESS_USDT as string } },
                quote: {
                    NativeToken: {
                        denom: denom,
                    },
                },
            },
        };

        return await CosmWasm.queryContractSmart(
            client,
            ADDRESS_ORACLE as string,
            queryMsg
        );
    }
}

export default OraiOracle;
