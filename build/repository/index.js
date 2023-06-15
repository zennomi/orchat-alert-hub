"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { MONGODB_URL } = process.env;
mongoose_1.default
    .connect(MONGODB_URL)
    .then(() => {
    console.log("Connected to DB");
})
    .catch((err) => {
    console.log(err);
    process.exit(1);
});
const mongooseConnection = mongoose_1.default.connection;
exports.default = mongooseConnection;
