"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const index_1 = __importDefault(require("../repository/index"));
const Token = index_1.default.model("Token", new mongoose_1.Schema({
    denom: { type: String, required: true, index: true, unique: true },
    price: { type: String, required: true },
    percentageChange1h: { type: String, required: true },
    percentageChange24h: { type: String, required: true },
    volume24h: { type: String, required: true },
    volumeChange24h: { type: String, required: true },
    marketCap: { type: String, required: true },
}, { timestamps: true }));
exports.default = Token;
