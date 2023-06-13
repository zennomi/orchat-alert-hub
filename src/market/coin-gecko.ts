import { CGDomain } from "../constants";
import axios from "axios";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

namespace CoinGecko {
    export async function getTop10MarketCap() {
        let requestURL =
            CGDomain +
            "/coins/markets" +
            "?vs_currency=usd" +
            "&order=market_cap_desc" +
            "&per_page=10" +
            "&page=1" +
            "&sparkline=false" +
            "&price_change_percentage=24h" +
            "&locale=en";
        let response = await axios.get(requestURL);
        let marketCapData = response.data;
        let result = [];
        for (let i = 0; i < marketCapData.length; i++) {
            let data = marketCapData[i];
            result.push({
                coingeckoId: data.id,
                symbol: data.symbol,
                name: data.name,
                marketCap: data.market_cap,
                marketCapChangePercentage:
                    data.market_cap_change_percentage_24h,
            });
        }

        return result;
    }

    export async function getMarketChart(coinId: String) {
        let requestURL =
            CGDomain +
            "/coins/" +
            coinId +
            "/market_chart" +
            "?vs_currency=usd" +
            "&days=7";
        let response = await axios.get(requestURL);
        let data = response.data;
        let prices = data.prices;
        let totalVolumes = data.total_volumes;
        let marketCaps = data.market_caps;

        let ohlcRequestUrl =
            CGDomain +
            "/coins/" +
            coinId +
            "/ohlc" +
            "?vs_currency=usd" +
            "&days=7";
        response = await axios.get(ohlcRequestUrl);

        return {
            prices: prices,
            totalVolumes: totalVolumes,
            marketCaps: marketCaps,
            ohlc: response.data,
        };
    }
}

export default CoinGecko;
