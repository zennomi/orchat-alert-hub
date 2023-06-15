"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cosmwasm_1 = require("cosmwasm");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const { RPC_ORAI_TESTNET, RPC_ORAI, MNEMONIC, LCD_ORAI, WS_RPC_ORAI, WS_RPC_ORAI_TESTNET } = process.env;
var CosmWasm;
(function (CosmWasm) {
    async function getCosmWasmClient() {
        const client = await cosmwasm_1.CosmWasmClient.connect(RPC_ORAI);
        return client;
    }
    CosmWasm.getCosmWasmClient = getCosmWasmClient;
    async function getSigningCosmWasmClient() {
        const wallet = await cosmwasm_1.Secp256k1HdWallet.fromMnemonic(MNEMONIC);
        const client = await cosmwasm_1.SigningCosmWasmClient.connectWithSigner(RPC_ORAI, wallet);
        return client;
    }
    CosmWasm.getSigningCosmWasmClient = getSigningCosmWasmClient;
    async function getTmClient() {
        const client = await tendermint_rpc_1.Tendermint34Client.connect(WS_RPC_ORAI);
        return client;
    }
    CosmWasm.getTmClient = getTmClient;
    async function getHeight(client) {
        return await client.getHeight();
    }
    CosmWasm.getHeight = getHeight;
    async function queryContractSmart(client, contractAddress, queryMsg) {
        return await client.queryContractSmart(contractAddress, queryMsg);
    }
    CosmWasm.queryContractSmart = queryContractSmart;
    async function queryAccount(client, accountAddress) {
        try {
            let account = await client.getAccount(accountAddress);
            return account;
        }
        catch (err) {
            return null;
        }
    }
    CosmWasm.queryAccount = queryAccount;
})(CosmWasm || (CosmWasm = {}));
exports.default = CosmWasm;
