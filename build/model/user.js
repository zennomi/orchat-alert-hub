"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const index_1 = __importDefault(require("../repository/index"));
const User = index_1.default.model("User", new mongoose_1.Schema({
    chatId: { type: String, required: true, unique: true, index: true },
    userId: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    languageCode: { type: String },
}, { timestamps: true }));
exports.default = User;
