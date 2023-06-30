import mongoose from "mongoose";
import Utils from "../utils";

const { MONGO_DATA_URL } = process.env;

namespace OtherProtocols {
    export async function queryLendingAPY() {
        let dbConnection = mongoose.createConnection(MONGO_DATA_URL as string);
        let lendingPool = dbConnection.getClient().db("LendingPools");
        let bRicher = dbConnection.getClient().db("BRicher");

        // Get aave
        let aave: any = await lendingPool.collection("lendings").findOne({
            _id: "0x1_0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
        } as any);
        let aaveInterestRate =
            aave["interestRateOfTokens"][
                "0xdac17f958d2ee523a2206206994597c13d831ec7"
            ];

        // Get venus
        let venus: any = await bRicher.collection("lendings").findOne({
            _id: "0x38_0xf6c14d4dfe45c132822ce28c646753c54994e59c_0x55d398326f99059ff775485246999027b3197955",
        } as any);
        let venusCurrentDetailROI = venus["currentDetailROI"];

        return {
            aaveDepositAPY: Utils.fixNumber(
                Number(Utils.aprToApy(aaveInterestRate["depositRate"] * 100)),
                2
            ),
            venusDepositAPY: Utils.fixNumber(
                Number(venusCurrentDetailROI["depositAPY"]) * 100,
                2
            ),
        };
    }

    export async function queryLiquidationList() {
        let dbConnection = mongoose.createConnection(MONGO_DATA_URL as string);
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
}

export default OtherProtocols;
