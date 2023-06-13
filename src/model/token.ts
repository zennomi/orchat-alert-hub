import mongoose, { Schema } from "mongoose";
import mongooseConnection from "../repository/index";

const Token = mongooseConnection.model(
    "Token",
    new Schema(
        {
            denom: { type: String, required: true, index: true, unique: true },
            price: { type: String, required: true },
            percentageChange1h: { type: String, required: true },
            percentageChange24h: { type: String, required: true },
            volume24h: { type: String, required: true },
            volumeChange24h: { type: String, required: true },
            marketCap: { type: String, required: true },
        },
        { timestamps: true }
    )
);

export default Token;
