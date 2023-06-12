import mongoose, { Schema } from "mongoose";
import mongooseConnection from "../repository/index";

const MarketData = mongooseConnection.model(
    "MarketData",
    new Schema(
        {
            dataType: {
                type: String,
                required: true,
                unique: true,
                index: true,
            },
            data: { type: Object, required: true },
            photo: { type: Array<Buffer>, required: true },
        },
        { timestamps: true }
    )
);

export default MarketData;
