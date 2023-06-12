import {
    CosmWasmClient,
    Secp256k1HdWallet,
    SigningCosmWasmClient
} from "cosmwasm";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
declare type JsonObject = any;

const {
    RPC_ORAI_TESTNET,
    RPC_ORAI,
    MNEMONIC,
    LCD_ORAI,
    WS_RPC_ORAI,
    WS_RPC_ORAI_TESTNET
} = process.env;

namespace CosmWasm {
    export async function getCosmWasmClient(): Promise<CosmWasmClient> {
        const client = await CosmWasmClient.connect(RPC_ORAI as string);
        return client;
    }

    export async function getSigningCosmWasmClient(): Promise<SigningCosmWasmClient> {
        const wallet = await Secp256k1HdWallet.fromMnemonic(MNEMONIC as string);
        const client = await SigningCosmWasmClient.connectWithSigner(
            RPC_ORAI as string,
            wallet
        );
        return client;
    }

    export async function getTmClient(): Promise<Tendermint34Client> {
        const client = await Tendermint34Client.connect(WS_RPC_ORAI as string);
        return client;
    }

    export async function getHeight(client: CosmWasmClient): Promise<number> {
        return await client.getHeight();
    }

    export async function queryContractSmart(
        client: CosmWasmClient,
        contractAddress: string,
        queryMsg: any
    ): Promise<JsonObject> {
        return await client.queryContractSmart(contractAddress, queryMsg);
    }

    export async function queryAccount(
        client: CosmWasmClient,
        accountAddress: string
    ) {
        try {
            let account = await client.getAccount(accountAddress);
            return account;
        } catch (err) {
            return null;
        }
    }
}

export default CosmWasm;
export { JsonObject };
