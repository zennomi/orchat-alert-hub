"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const market_data_1 = __importDefault(require("../model/market-data"));
var MarketDataRepository;
(function (MarketDataRepository) {
    async function createOrUpdate(dataType, data, photo) {
        return await market_data_1.default.updateOne({ dataType: dataType }, { dataType: dataType, data: data, photo: photo }, { upsert: true, setDefaultsOnInsert: true });
    }
    MarketDataRepository.createOrUpdate = createOrUpdate;
    async function findByType(type) {
        return await market_data_1.default.findOne({ dataType: type });
    }
    MarketDataRepository.findByType = findByType;
})(MarketDataRepository || (MarketDataRepository = {}));
exports.default = MarketDataRepository;
