"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneyMarketInfoMessage = exports.moneyMarketInfo = void 0;
const cron_1 = __importDefault(require("cron"));
require("chartjs-adapter-moment");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const constants_1 = require("../constants");
const cosmwasm_1 = __importDefault(require("../cosmwasm"));
const orchai_lending_1 = __importDefault(require("../cosmwasm/orchai-lending"));
const message_creation_1 = __importDefault(require("../telegram/message-creation"));
const event_repository_1 = __importDefault(require("../repository/event-repository"));
const telegram_1 = require("../telegram");
const coin_gecko_1 = __importDefault(require("../market/coin-gecko"));
const market_data_repository_1 = __importDefault(require("../repository/market-data-repository"));
const token_repository_1 = __importDefault(require("../repository/token-repository"));
const coin_market_cap_1 = __importDefault(require("../market/coin-market-cap"));
var chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({
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
exports.moneyMarketInfo = moneyMarketInfo;
var moneyMarketInfoMessage = "";
exports.moneyMarketInfoMessage = moneyMarketInfoMessage;
var CronJob;
(function (CronJob) {
    CronJob.crawlTop10MarketCap = new cron_1.default.CronJob({
        cronTime: constants_1.cronTime.perHour10,
        onTick: async () => {
            try {
                let data = await coin_gecko_1.default.getTop10MarketCap();
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
                        labels: chartData.map((row) => row.symbol.toUpperCase()),
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
                await market_data_repository_1.default.createOrUpdate(constants_1.MARKET_DATA_TYPE.TOP_10_MARKET_CAP, data, [photo]);
            }
            catch (err) {
                console.log(err);
            }
        },
        onComplete: () => { },
        utcOffset: +7,
        runOnInit: false,
    });
    CronJob.crawlTokenData = new cron_1.default.CronJob({
        cronTime: constants_1.cronTime.perHour0,
        onTick: async () => {
            try {
                await coin_market_cap_1.default.updateTokens();
            }
            catch (err) {
                console.log(err);
            }
        },
        onComplete: () => { },
        utcOffset: +7,
        runOnInit: true,
    });
    CronJob.crawlTokenMarketData = new cron_1.default.CronJob({
        cronTime: constants_1.cronTime.perHour0,
        onTick: async () => {
            try {
                let listSupportedToken = Object.keys(constants_1.SUPPORTED_TOKEN);
                for (let i = 0; i < listSupportedToken.length; i++) {
                    let coinId = constants_1.CGMappingID[listSupportedToken[i]];
                    let data = await coin_gecko_1.default.getMarketChart(coinId);
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
                    const marketCapAndTotalVolumesPhoto = await chartJSNodeCanvas.renderToBuffer({
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
                    let currentPrice = Number((await token_repository_1.default.findByDenom(constants_1.SUPPORTED_TOKEN[listSupportedToken[i]]))?.price);
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
                        beforeDatasetsDraw(chart, args, pluginOptions) {
                            const { ctx, data, chartArea: { top, bottom, left, right, width, height, }, scales: { x, y }, } = chart;
                            ctx.save();
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = "rgba(0,0,0,1)";
                            // console.log(chart.getDatasetMeta(0).data[0].x);
                            // console.log(chart.getDatasetMeta(0).data[0].y);
                            data.datasets[0].data.forEach((dataPoint, index) => {
                                ctx.beginPath();
                                ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
                                ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(data.datasets[0].data[index].h));
                                ctx.stroke();
                                ctx.beginPath();
                                ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
                                ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(data.datasets[0].data[index].l));
                                ctx.stroke();
                            });
                        },
                    };
                    const pricesPhoto = await chartJSNodeCanvas.renderToBuffer({
                        type: "bar",
                        data: {
                            datasets: [
                                {
                                    label: "USD",
                                    data: pricesDataset,
                                    backgroundColor: (ctx) => {
                                        let o = ctx.raw.o;
                                        let c = ctx.raw.c;
                                        let color = "";
                                        if (c >= o) {
                                            color = "rgba(75,192,192,1)";
                                        }
                                        else {
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
                                                content: Number(currentPrice).toFixed(4),
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        plugins: [candleStick],
                    });
                    let marketDataType = constants_1.MARKET_DATA_TYPE.TOKEN +
                        "_" +
                        constants_1.SUPPORTED_TOKEN[listSupportedToken[i]];
                    await market_data_repository_1.default.createOrUpdate(marketDataType, data, [pricesPhoto, marketCapAndTotalVolumesPhoto]);
                    // console.log(SUPPORTED_TOKEN[listSupportedToken[i]]);
                }
            }
            catch (err) {
                console.log(err);
            }
        },
        onComplete: () => { },
        utcOffset: +7,
        runOnInit: true,
    });
    CronJob.alertCapacityThreshold = new cron_1.default.CronJob({
        cronTime: constants_1.cronTime.perHour20,
        onTick: async () => {
            let cosmwasmClient = await cosmwasm_1.default.getCosmWasmClient();
            let events = await event_repository_1.default.findByType(constants_1.EVENT_TYPE.ORCHAI);
            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                let walletAddress = event.params?.get("walletAddress");
                if (walletAddress) {
                    let capacityThreshold = Number(event.params?.get("capacityThreshold") || "0");
                    let borrowerInfo = await orchai_lending_1.default.queryBorrowerInfo(cosmwasmClient, walletAddress);
                    if (capacityThreshold > 0 &&
                        Number(borrowerInfo.capacity) * 100 >= capacityThreshold) {
                        telegram_1.TelegramBot.sendMessage(event.chatId, message_creation_1.default.capacityThresholdAlert(borrowerInfo, capacityThreshold));
                    }
                }
            }
        },
        onComplete: () => { },
        utcOffset: +7,
        runOnInit: false,
    });
    CronJob.crawMoneyMarketInfoMessage = new cron_1.default.CronJob({
        cronTime: constants_1.cronTime.perHour10,
        onTick: async () => {
            let cosmwasmClient = await cosmwasm_1.default.getCosmWasmClient();
            let marketInfo = await orchai_lending_1.default.queryMarketInfo(cosmwasmClient);
            let messageText = message_creation_1.default.orchaiInfo(marketInfo);
            moneyMarketInfo.message = messageText;
            moneyMarketInfo.lendAPY = marketInfo.lendAPY;
            moneyMarketInfo.borrowAPY = marketInfo.borrowAPY;
        },
        onComplete: () => { },
        utcOffset: +7,
        runOnInit: true,
    });
    async function start() {
        CronJob.crawMoneyMarketInfoMessage.start();
        CronJob.crawlTop10MarketCap.start();
        CronJob.crawlTokenData.start();
        CronJob.crawlTokenMarketData.start();
        CronJob.alertCapacityThreshold.start();
    }
    CronJob.start = start;
})(CronJob || (CronJob = {}));
exports.default = CronJob;
async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
