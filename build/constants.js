"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_TOKEN = exports.MARKET_DATA_TYPE = exports.EVENT_TYPE = exports.quoteAPI = exports.memeAPI = exports.CGMappingID = exports.CGDomain = exports.CMCMappingID = exports.CMCDomain = exports.cronTime = exports.swaggerOptions = void 0;
exports.swaggerOptions = {
    openapi: "3.0.0",
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Orchai chatbot Express API with Swagger",
            version: "0.1.0",
            description: "This is website for handle orchai chatbot",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
        },
        servers: [
            {
                url: "http://localhost:8080",
                description: "Local server",
            },
        ],
    },
    apis: ["./routes/*.js"],
};
exports.cronTime = {
    perSecond: "*/60 * * * * *",
    perMinute: "0 * * * * *",
    per30Minutes: "0 */30 * * * *",
    perHour0: "0 0 * * * *",
    perHour10: "0 10 * * * *",
    perHour20: "0 20 * * * *",
    per2Hours0: "0 0 */2 * * *",
    perDay: "0 0 0 * * *",
    perMonth: "0 0 0 0 * *",
};
exports.CMCDomain = "https://pro-api.coinmarketcap.com";
exports.CMCMappingID = {
    BTC: 1,
    USDC: 3408,
    BNB: 1839,
    ETH: 1027,
    ATOM: 3794,
    OSMO: 12220,
    DAI: 4943,
    XRP: 52,
    ADA: 2010,
    DOGE: 74,
    SOL: 5426,
    MATIC: 3890,
    DOT: 6636,
    LTC: 2,
    SHIB: 5994,
    ARB: 938,
    SAND: 6210,
    RNDR: 5690,
    CAKE: 7186,
    ORAI: 7533,
    AIRI: 11563,
    CRO: 3635,
    LUNC: 4172,
    KAVA: 4846,
    RUNE: 4157,
    ROSE: 7653,
    TRX: 1958,
};
exports.CGDomain = "https://api.coingecko.com/api/v3";
exports.CGMappingID = {
    ORAI: "oraichain-token",
    ATOM: "cosmos",
    OSMO: "osmosis",
    BTC: "bitcoin",
    ETH: "ethereum",
    AIRI: "airight",
    CRO: "crypto-com-chain",
    LUNC: "luna-wormhole",
    KAVA: "kava",
    RUNE: "thorchain",
    ROSE: "oasis-network",
    TRX: "tron",
};
exports.memeAPI = "https://meme-api.com/gimme";
exports.quoteAPI = "https://api.quotable.io/random";
exports.EVENT_TYPE = {
    ORCHAI: "event_type_orchai",
    ORAI_DEX: "event_type_orai_dex",
};
exports.MARKET_DATA_TYPE = {
    TOP_10_MARKET_CAP: "top_10_market_cap",
    TOKEN: "token",
};
exports.SUPPORTED_TOKEN = {
    ORAI: "orai",
    ATOM: "atom",
    OSMO: "osmo",
    BTC: "btc",
    ETH: "eth",
    AIRI: "airi",
    CRO: "cro",
    LUNC: "lunc",
    KAVA: "kava",
    RUNE: "rune",
    ROSE: "rose",
    TRX: "trx",
};
