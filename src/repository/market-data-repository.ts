import MarketData from "../model/market-data";

namespace MarketDataRepository {
    export async function createOrUpdate(
        dataType: String,
        data: object,
        photo: Array<Buffer>
    ) {
        return await MarketData.updateOne(
            { dataType: dataType },
            { dataType: dataType, data: data, photo: photo },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    export async function findByType(type: string) {
        return await MarketData.findOne({ dataType: type });
    }
}

export default MarketDataRepository;
