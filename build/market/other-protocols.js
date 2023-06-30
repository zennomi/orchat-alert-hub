"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = __importDefault(require("../utils"));
const { MONGO_DATA_URL } = process.env;
var OtherProtocols;
(function (OtherProtocols) {
    async function queryLendingAPY() {
        let dbConnection = mongoose_1.default.createConnection(MONGO_DATA_URL);
        let lendingPool = dbConnection.getClient().db("LendingPools");
        let bRicher = dbConnection.getClient().db("BRicher");
        // Get aave
        let aave = await lendingPool.collection("lendings").findOne({
            _id: "0x1_0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
        });
        let aaveInterestRate = aave["interestRateOfTokens"]["0xdac17f958d2ee523a2206206994597c13d831ec7"];
        // Get venus
        let venus = await bRicher.collection("lendings").findOne({
            _id: "0x38_0xf6c14d4dfe45c132822ce28c646753c54994e59c_0x55d398326f99059ff775485246999027b3197955",
        });
        let venusCurrentDetailROI = venus["currentDetailROI"];
        return {
            aaveDepositAPY: utils_1.default.fixNumber(Number(utils_1.default.aprToApy(aaveInterestRate["depositRate"] * 100)), 2),
            venusDepositAPY: utils_1.default.fixNumber(Number(venusCurrentDetailROI["depositAPY"]) * 100, 2),
        };
    }
    OtherProtocols.queryLendingAPY = queryLendingAPY;
    async function queryLiquidationList() {
        let dbConnection = mongoose_1.default.createConnection(MONGO_DATA_URL);
        let bRicher = dbConnection.getClient().db("BRicher");
        let aave = await bRicher
            .collection("aave_liquidated_wallets")
            .find({ healthFactor: { $lt: 1 } })
            .sort({ deposit: -1 })
            .toArray();
        let venus = await bRicher
            .collection("venus_liquidated_wallets")
            .find({ healthFactor: { $lt: 1 } })
            .sort({ deposit: -1 })
            .toArray();
        return {
            aave: aave,
            venus: venus,
        };
    }
    OtherProtocols.queryLiquidationList = queryLiquidationList;
})(OtherProtocols || (OtherProtocols = {}));
exports.default = OtherProtocols;
