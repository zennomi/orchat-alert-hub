import cron from "cron";
import "chartjs-adapter-moment";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import {
    CGMappingID,
    EVENT_TYPE,
    MARKET_DATA_TYPE,
    SUPPORTED_TOKEN,
    cronTime,
} from "../constants";
import CosmWasm from "../cosmwasm";
import OrchaiLending from "../cosmwasm/orchai-lending";
import MessageCreation from "../telegram/message-creation";
import EventRepository from "../repository/event-repository";
import { TelegramBot } from "../telegram";
import CoinGecko from "../market/coin-gecko";
import MarketDataRepository from "../repository/market-data-repository";
import TokenRepository from "../repository/token-repository";
import CoinMarketCap from "../market/coin-market-cap";
import OtherProtocols from "../market/other-protocols";
//@ts-ignore
import { Pagination } from "telegraf-pagination";

var chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: 1000,
    height: 800,
    plugins: {
        modern: ["chartjs-plugin-annotation"],
    },
});

var moneyMarketInfo = {
    message: "",
    lendAPY: 0,
    borrowAPY: 0,
};
var moneyMarketInfoMessage = "";
namespace CronJob {
    export const crawlTop10MarketCap = new cron.CronJob({
        cronTime: cronTime.perHour10,
        onTick: async () => {
            try {
                let data = await CoinGecko.getTop10MarketCap();

                let chartData = [];
                for (let i = 0; i < data.length; i++) {
                    chartData.push({
                        symbol: data[i].symbol,
                        marketCap: data[i].marketCap,
                    });
                }

                const photo = await chartJSNodeCanvas.renderToBuffer({
                    type: "bar",
                    data: {
                        labels: chartData.map((row) =>
                            row.symbol.toUpperCase()
                        ),
                        datasets: [
                            {
                                label: "Market Cap",
                                data: chartData.map((row) => row.marketCap),
                                backgroundColor: "rgb(30,180,240)",
                            },
                        ],
                    },
                    options: {
                        indexAxis: "y",
                    },
                });
                await MarketDataRepository.createOrUpdate(
                    MARKET_DATA_TYPE.TOP_10_MARKET_CAP,
                    data,
                    [photo]
                );
            } catch (err) {
                console.log(err);
            }
        },
        onComplete: () => {},
        utcOffset: +7,
        runOnInit: false,
    });

    export const crawlTokenData = new cron.CronJob({
        cronTime: cronTime.perHour0,
        onTick: async () => {
            try {
                await CoinMarketCap.updateTokens();
            } catch (err) {
                console.log(err);
            }
        },
        onComplete: () => {},
        utcOffset: +7,
        runOnInit: true,
    });

    export const crawlTokenMarketData = new cron.CronJob({
        cronTime: cronTime.perHour0,
        onTick: async () => {
            try {
                let listSupportedToken = Object.keys(SUPPORTED_TOKEN);

                for (let i = 0; i < listSupportedToken.length; i++) {
                    let coinId = CGMappingID[listSupportedToken[i]];
                    let data = await CoinGecko.getMarketChart(coinId);
                    // console.log(data.prices.length);

                    let marketCapDataset = [];
                    for (let i = 0; i < data.marketCaps.length; i++) {
                        marketCapDataset.push({
                            x: data.marketCaps[i][0],
                            y: data.marketCaps[i][1],
                        });
                    }
                    let totalVolumesDataset = [];
                    for (let i = 0; i < data.totalVolumes.length; i++) {
                        totalVolumesDataset.push({
                            x: data.totalVolumes[i][0],
                            y: data.totalVolumes[i][1],
                        });
                    }
                    const marketCapAndTotalVolumesPhoto =
                        await chartJSNodeCanvas.renderToBuffer({
                            type: "line",
                            data: {
                                datasets: [
                                    {
                                        label: "Market Cap",
                                        backgroundColor: "rgb(30,180,240)",
                                        borderColor: "rgb(30,180,240)",
                                        pointRadius: 0,
                                        data: marketCapDataset,
                                        yAxisID: "y0",
                                        borderWidth: 0.69,
                                    },
                                    {
                                        label: "Total Volumes",
                                        backgroundColor: "rgb(215,75,175)",
                                        borderColor: "rgb(215,75,175)",
                                        pointRadius: 0,
                                        data: totalVolumesDataset,
                                        yAxisID: "y1",
                                        borderWidth: 0.69,
                                    },
                                ],
                            },
                            options: {
                                scales: {
                                    x: {
                                        type: "timeseries",
                                        time: {
                                            unit: "day",
                                        },
                                    },
                                    y0: {
                                        type: "linear",
                                        display: true,
                                        position: "left",
                                        title: {
                                            display: true,
                                            text: "USD",
                                        },
                                    },
                                    y1: {
                                        type: "linear",
                                        display: true,
                                        position: "right",

                                        // grid line settings
                                        grid: {
                                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                                        },
                                    },
                                },
                            },
                        });

                    let currentPrice = Number(
                        (
                            await TokenRepository.findByDenom(
                                SUPPORTED_TOKEN[listSupportedToken[i]]
                            )
                        )?.price
                    );

                    let pricesDataset = [];
                    for (let i = 0; i < data.ohlc.length; i++) {
                        pricesDataset.push({
                            x: data.ohlc[i][0],
                            o: data.ohlc[i][1],
                            h: data.ohlc[i][2],
                            l: data.ohlc[i][3],
                            c: data.ohlc[i][4],
                            s: [data.ohlc[i][1], data.ohlc[i][4]],
                        });
                    }

                    // candlestick plugin
                    const candleStick = {
                        id: "candlestick",
                        beforeDatasetsDraw(
                            chart: any,
                            args: any,
                            pluginOptions: any
                        ) {
                            const {
                                ctx,
                                data,
                                chartArea: {
                                    top,
                                    bottom,
                                    left,
                                    right,
                                    width,
                                    height,
                                },
                                scales: { x, y },
                            } = chart;
                            ctx.save();

                            ctx.lineWidth = 1;
                            ctx.strokeStyle = "rgba(0,0,0,1)";

                            // console.log(chart.getDatasetMeta(0).data[0].x);
                            // console.log(chart.getDatasetMeta(0).data[0].y);
                            data.datasets[0].data.forEach(
                                (dataPoint: any, index: any) => {
                                    ctx.beginPath();
                                    ctx.moveTo(
                                        chart.getDatasetMeta(0).data[index].x,
                                        chart.getDatasetMeta(0).data[index].y
                                    );
                                    ctx.lineTo(
                                        chart.getDatasetMeta(0).data[index].x,
                                        y.getPixelForValue(
                                            data.datasets[0].data[index].h
                                        )
                                    );
                                    ctx.stroke();

                                    ctx.beginPath();
                                    ctx.moveTo(
                                        chart.getDatasetMeta(0).data[index].x,
                                        chart.getDatasetMeta(0).data[index].y
                                    );
                                    ctx.lineTo(
                                        chart.getDatasetMeta(0).data[index].x,
                                        y.getPixelForValue(
                                            data.datasets[0].data[index].l
                                        )
                                    );
                                    ctx.stroke();
                                }
                            );
                        },
                    };
                    const pricesPhoto = await chartJSNodeCanvas.renderToBuffer({
                        type: "bar",
                        data: {
                            datasets: [
                                {
                                    label: "USD",
                                    data: pricesDataset as any,
                                    backgroundColor: (ctx: any) => {
                                        let o = ctx.raw.o;
                                        let c = ctx.raw.c;
                                        let color = "";
                                        if (c >= o) {
                                            color = "rgba(75,192,192,1)";
                                        } else {
                                            color = "rgba(255,26,104,1)";
                                        }
                                        return color;
                                    },
                                    borderColor: "rgba(0,0,0,1)",
                                    borderWidth: 1,
                                    borderSkipped: false,
                                },
                            ],
                        },
                        options: {
                            parsing: {
                                xAxisKey: "x",
                                yAxisKey: "s",
                            },
                            scales: {
                                x: {
                                    type: "timeseries",
                                    time: {
                                        unit: "day",
                                    },
                                },
                                y: {
                                    beginAtZero: false,
                                    grace: "10%",
                                    type: "linear",
                                    display: true,
                                    position: "left",
                                    title: {
                                        display: true,
                                        text: "USD",
                                    },
                                },
                            },
                            plugins: {
                                legend: { display: false },
                                annotation: {
                                    annotations: {
                                        currentPrice: {
                                            type: "line",
                                            yMin: currentPrice,
                                            yMax: currentPrice,
                                            borderColor: "grey",
                                            borderWidth: 2,
                                            borderDash: [10, 20],
                                            label: {
                                                display: true,
                                                content:
                                                    Number(
                                                        currentPrice
                                                    ).toFixed(4),
                                            },
                                        },
                                    },
                                },
                            } as any,
                        },
                        plugins: [candleStick],
                    });

                    let marketDataType =
                        MARKET_DATA_TYPE.TOKEN +
                        "_" +
                        SUPPORTED_TOKEN[listSupportedToken[i]];
                    await MarketDataRepository.createOrUpdate(
                        marketDataType,
                        data,
                        [pricesPhoto, marketCapAndTotalVolumesPhoto]
                    );
                    // console.log(SUPPORTED_TOKEN[listSupportedToken[i]]);
                }
            } catch (err) {
                console.log(err);
            }
        },
        onComplete: () => {},
        utcOffset: +7,
        runOnInit: true,
    });

    export const alertCapacityThreshold = new cron.CronJob({
        cronTime: cronTime.perHour20,
        onTick: async () => {
            let cosmwasmClient = await CosmWasm.getCosmWasmClient();
            let events = await EventRepository.findByType(EVENT_TYPE.ORCHAI);
            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                let walletAddress = event.params?.get("walletAddress");
                if (walletAddress) {
                    let capacityThreshold = Number(
                        event.params?.get("capacityThreshold") || "0"
                    );
                    let borrowerInfo = await OrchaiLending.queryBorrowerInfo(
                        cosmwasmClient,
                        walletAddress
                    );

                    if (
                        capacityThreshold > 0 &&
                        Number(borrowerInfo.capacity) >= capacityThreshold
                    ) {
                        TelegramBot.sendMessage(
                            event.chatId,
                            MessageCreation.capacityThresholdAlert(
                                borrowerInfo,
                                capacityThreshold
                            )
                        );
                    }
                }
            }
        },
        onComplete: () => {},
        utcOffset: +7,
        runOnInit: false,
    });

    export const crawlOtherProtocolsAPY = new cron.CronJob({
        cronTime: cronTime.perHour10,
        onTick: async () => {
            let result = await OtherProtocols.queryLendingAPY();
            let cosmwasmClient = await CosmWasm.getCosmWasmClient();
            let marketInfo = await OrchaiLending.queryMarketInfo(
                cosmwasmClient
            );
            let data = {
                orchaiDepositAPY: marketInfo.lendAPY,
                aaveDepositAPY: result.aaveDepositAPY,
                venusDepositAPY: result.venusDepositAPY,
            };
            // console.log(data);
            await MarketDataRepository.createOrUpdate(
                MARKET_DATA_TYPE.OTHER_PROTOCOLS_APY,
                data,
                []
            );
        },
        onComplete: () => {},
        utcOffset: +7,
        runOnInit: false,
    });

    export const crawlOtherProtocolsLiquidationList = new cron.CronJob({
        cronTime: cronTime.perHour30,
        onTick: async () => {
            let liquidationList = await OtherProtocols.queryLiquidationList();
            await MarketDataRepository.createOrUpdate(
                MARKET_DATA_TYPE.OTHER_PROTOCOLS_LIQUIDATION_LIST + "_aave",
                liquidationList.aave,
                []
            );
            await MarketDataRepository.createOrUpdate(
                MARKET_DATA_TYPE.OTHER_PROTOCOLS_LIQUIDATION_LIST + "_venus",
                liquidationList.venus,
                []
            );
        },
        onComplete: () => {},
        utcOffset: +7,
        runOnInit: true,
    });

    export const crawlMoneyMarketInfoMessage = new cron.CronJob({
        cronTime: cronTime.perHour10,
        onTick: async () => {
            let cosmwasmClient = await CosmWasm.getCosmWasmClient();
            let marketInfo = await OrchaiLending.queryMarketInfo(
                cosmwasmClient
            );
            let messageText = MessageCreation.orchaiInfo(marketInfo);

            moneyMarketInfo.message = messageText;
            moneyMarketInfo.lendAPY = marketInfo.lendAPY;
            moneyMarketInfo.borrowAPY = marketInfo.borrowAPY;
        },
        onComplete: () => {},
        utcOffset: +7,
        runOnInit: true,
    });

    export async function start() {
        crawlOtherProtocolsAPY.start();
        crawlMoneyMarketInfoMessage.start();
        crawlTop10MarketCap.start();
        crawlTokenData.start();
        crawlTokenMarketData.start();
        alertCapacityThreshold.start();
    }
}

export default CronJob;
export { moneyMarketInfo, moneyMarketInfoMessage };

async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}
