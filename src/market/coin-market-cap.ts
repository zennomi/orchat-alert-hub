import axios from "axios";
import { CMCDomain, CMCMappingID, SUPPORTED_TOKEN } from "../constants";
import TokenRepository from "../repository/token-repository";

const { CMC_API_KEY } = process.env;

namespace CoinMarketCap {
    export async function updateTokens() {
        let listSupportedToken = Object.keys(SUPPORTED_TOKEN);
        let queryIdValue = "";
        for (let i = 0; i < listSupportedToken.length; i++) {
            let tokenId = CMCMappingID[listSupportedToken[i]];
            if (tokenId != undefined) {
                queryIdValue += tokenId.toString();
                if (i != listSupportedToken.length - 1) {
                    queryIdValue += ",";
                }
            }
        }
        let requestUrl = CMCDomain + "/v2/cryptocurrency/quotes/latest";
        let response = await axios.get(requestUrl, {
            params: {
                id: queryIdValue,
            },
            headers: {
                Accept: "application/json",
                "X-CMC_PRO_API_KEY": CMC_API_KEY as string,
            },
        });
        if (response.status == 200) {
            let responseData = response.data;
            let data = responseData["data"];
            for (let i = 0; i < listSupportedToken.length; i++) {
                let tokenDenom = SUPPORTED_TOKEN[listSupportedToken[i]];
                let tokenId = CMCMappingID[listSupportedToken[i]];
                if (tokenId != undefined) {
                    let tokenData = data[tokenId];
                    let tokenPrice = tokenData["quote"]["USD"]["price"];
                    let percentageChange1h =
                        tokenData["quote"]["USD"]["percent_change_1h"];
                    let percentageChange24h =
                        tokenData["quote"]["USD"]["percent_change_24h"];
                    let volume24h = tokenData["quote"]["USD"]["volume_24h"];
                    let volumeChange24h =
                        tokenData["quote"]["USD"]["volume_change_24h"];
                    let marketCap = tokenData["quote"]["USD"]["market_cap"];
                    await TokenRepository.createOrUpdate(
                        tokenDenom,
                        tokenPrice,
                        percentageChange1h,
                        percentageChange24h,
                        volume24h,
                        volumeChange24h,
                        marketCap
                    );
                }
            }
        }
    }
}

export default CoinMarketCap;
