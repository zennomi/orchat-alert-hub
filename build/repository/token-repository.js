"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("../model/token"));
var TokenRepository;
(function (TokenRepository) {
    async function createOrUpdate(denom, price, percentageChange1h, percentageChange24h, volume24h, volumeChange24h, marketCap) {
        return await token_1.default.updateOne({ denom: denom }, {
            denom: denom,
            price: price,
            percentageChange1h: percentageChange1h,
            percentageChange24h: percentageChange24h,
            volume24h: volume24h,
            volumeChange24h: volumeChange24h,
            marketCap: marketCap,
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    TokenRepository.createOrUpdate = createOrUpdate;
    async function findByDenom(denom) {
        return await token_1.default.findOne({ denom: denom });
    }
    TokenRepository.findByDenom = findByDenom;
})(TokenRepository || (TokenRepository = {}));
exports.default = TokenRepository;
