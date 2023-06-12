import mongoose from "mongoose";
import mongooseConnection from "../repository/index";

const Event = mongooseConnection.model(
    "Event",
    new mongoose.Schema(
        {
            eventId: {
                type: String,
                required: true,
                unique: true,
                index: true,
            },
            chatId: { type: String, required: true, index: true },
            eventType: { type: String, required: true, index: true },
            params: { type: Map, of: String },
            notificationStatus: {
                type: Boolean,
                default: false,
                required: true,
            },
        },
        { timestamps: true }
    )
);

export default Event;
