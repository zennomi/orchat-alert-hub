"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const index_1 = __importDefault(require("../repository/index"));
const MarketData = index_1.default.model("MarketData", new mongoose_1.Schema({
    dataType: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    data: { type: Object, required: true },
    photo: { type: (Array), required: true },
}, { timestamps: true }));
exports.default = MarketData;
