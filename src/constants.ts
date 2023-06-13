export const swaggerOptions = {
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

export const cronTime = {
    perSecond: "*/60 * * * * *",
    perMinute: "0 * * * * *",
    per30Minutes: "0 */30 * * * *",
    perHour0: "0 0 * * * *",
    perHour10: "0 10 * * * *",
    perHour20: "0 20 * * * *",
    perDay: "0 0 0 * * *",
    perMonth: "0 0 0 0 * *",
};

export const CMCDomain = "https://pro-api.coinmarketcap.com";

export const CMCMappingID: { [key: string]: number } = {
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
};

export const CGDomain = "https://api.coingecko.com/api/v3";

export const CGMappingID: { [key: string]: string } = {
    ORAI: "oraichain-token",
    ATOM: "cosmos",
    OSMO: "osmosis",
    BTC: "bitcoin",
    ETH: "ethereum",
};

export const memeAPI = "https://meme-api.com/gimme";
export const quoteAPI = "https://api.quotable.io/random";
export const EVENT_TYPE: { [key: string]: string } = {
    ORCHAI: "event_type_orchai",
    ORAI_DEX: "event_type_orai_dex",
};

export const MARKET_DATA_TYPE: { [key: string]: string } = {
    TOP_10_MARKET_CAP: "top_10_market_cap",
    TOKEN: "token",
};

export const SUPPORTED_TOKEN: { [key: string]: string } = {
    ORAI: "orai",
    ATOM: "atom",
    OSMO: "osmo",
    BTC: "btc",
    ETH: "eth",
};
