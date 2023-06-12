import mongoose, { Schema } from "mongoose";
import mongooseConnection from "../repository/index";

const User = mongooseConnection.model(
    "User",
    new Schema(
        {
            chatId: { type: String, required: true, unique: true, index: true },
            userId: { type: String },
            firstName: { type: String },
            lastName: { type: String },
            username: { type: String },
            languageCode: { type: String },
        },
        { timestamps: true }
    )
);

export default User;
