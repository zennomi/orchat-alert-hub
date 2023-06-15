"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
const token_repository_1 = __importDefault(require("../repository/token-repository"));
const { CMC_API_KEY } = process.env;
var CoinMarketCap;
(function (CoinMarketCap) {
    async function updateTokens() {
        let listSupportedToken = Object.keys(constants_1.SUPPORTED_TOKEN);
        let queryIdValue = "";
        for (let i = 0; i < listSupportedToken.length; i++) {
            let tokenId = constants_1.CMCMappingID[listSupportedToken[i]];
            if (tokenId != undefined) {
                queryIdValue += tokenId.toString();
                if (i != listSupportedToken.length - 1) {
                    queryIdValue += ",";
                }
            }
        }
        let requestUrl = constants_1.CMCDomain + "/v2/cryptocurrency/quotes/latest";
        let response = await axios_1.default.get(requestUrl, {
            params: {
                id: queryIdValue,
            },
            headers: {
                Accept: "application/json",
                "X-CMC_PRO_API_KEY": CMC_API_KEY,
            },
        });
        if (response.status == 200) {
            let responseData = response.data;
            let data = responseData["data"];
            for (let i = 0; i < listSupportedToken.length; i++) {
                let tokenDenom = constants_1.SUPPORTED_TOKEN[listSupportedToken[i]];
                let tokenId = constants_1.CMCMappingID[listSupportedToken[i]];
                if (tokenId != undefined) {
                    let tokenData = data[tokenId];
                    let tokenPrice = tokenData["quote"]["USD"]["price"];
                    let percentageChange1h = tokenData["quote"]["USD"]["percent_change_1h"];
                    let percentageChange24h = tokenData["quote"]["USD"]["percent_change_24h"];
                    let volume24h = tokenData["quote"]["USD"]["volume_24h"];
                    let volumeChange24h = tokenData["quote"]["USD"]["volume_change_24h"];
                    let marketCap = tokenData["quote"]["USD"]["market_cap"];
                    await token_repository_1.default.createOrUpdate(tokenDenom, tokenPrice, percentageChange1h, percentageChange24h, volume24h, volumeChange24h, marketCap);
                }
            }
        }
    }
    CoinMarketCap.updateTokens = updateTokens;
})(CoinMarketCap || (CoinMarketCap = {}));
exports.default = CoinMarketCap;
