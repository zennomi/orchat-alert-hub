"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("../repository/index"));
const Event = index_1.default.model("Event", new mongoose_1.default.Schema({
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
}, { timestamps: true }));
exports.default = Event;
