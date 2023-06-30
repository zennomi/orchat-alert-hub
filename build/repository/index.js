"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { MONGODB_URL } = process.env;
const mongooseConnection = mongoose_1.default.createConnection(MONGODB_URL);
exports.default = mongooseConnection;
