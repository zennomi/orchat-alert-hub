"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const axios_1 = __importDefault(require("axios"));
var CoinGecko;
(function (CoinGecko) {
    async function getTop10MarketCap() {
        let requestURL = constants_1.CGDomain +
            "/coins/markets" +
            "?vs_currency=usd" +
            "&order=market_cap_desc" +
            "&per_page=10" +
            "&page=1" +
            "&sparkline=false" +
            "&price_change_percentage=24h" +
            "&locale=en";
        let response = {};
        let isSuccess = false;
        while (!isSuccess) {
            try {
                response = await axios_1.default.get(requestURL);
                isSuccess = true;
            }
            catch (err) { }
        }
        let marketCapData = response.data;
        let result = [];
        for (let i = 0; i < marketCapData.length; i++) {
            let data = marketCapData[i];
            result.push({
                coingeckoId: data.id,
                symbol: data.symbol,
                name: data.name,
                price: data.current_price,
                priceChangePercentage: data.price_change_percentage_24h,
                marketCap: data.market_cap,
                marketCapChangePercentage: data.market_cap_change_percentage_24h,
            });
        }
        return result;
    }
    CoinGecko.getTop10MarketCap = getTop10MarketCap;
    async function getMarketChart(coinId) {
        let requestURL = constants_1.CGDomain +
            "/coins/" +
            coinId +
            "/market_chart" +
            "?vs_currency=usd" +
            "&days=7";
        let response = {};
        let isSuccess = false;
        while (!isSuccess) {
            try {
                response = await axios_1.default.get(requestURL);
                isSuccess = true;
            }
            catch (err) { }
        }
        let data = response.data;
        let prices = data.prices;
        let totalVolumes = data.total_volumes;
        let marketCaps = data.market_caps;
        let ohlcRequestUrl = constants_1.CGDomain +
            "/coins/" +
            coinId +
            "/ohlc" +
            "?vs_currency=usd" +
            "&days=7";
        isSuccess = false;
        while (!isSuccess) {
            try {
                response = await axios_1.default.get(ohlcRequestUrl);
                isSuccess = true;
            }
            catch (err) { }
        }
        return {
            prices: prices,
            totalVolumes: totalVolumes,
            marketCaps: marketCaps,
            ohlc: response.data,
        };
    }
    CoinGecko.getMarketChart = getMarketChart;
})(CoinGecko || (CoinGecko = {}));
exports.default = CoinGecko;
