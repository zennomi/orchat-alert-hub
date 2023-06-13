import Token from "../model/token";

namespace TokenRepository {
    export async function createOrUpdate(
        denom: string,
        price: string,
        percentageChange1h: string,
        percentageChange24h: string,
        volume24h: string,
        volumeChange24h: string,
        marketCap: string
    ) {
        return await Token.updateOne(
            { denom: denom },
            {
                denom: denom,
                price: price,
                percentageChange1h: percentageChange1h,
                percentageChange24h: percentageChange24h,
                volume24h: volume24h,
                volumeChange24h: volumeChange24h,
                marketCap: marketCap,
            },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    export async function findByDenom(denom: string) {
        return await Token.findOne({ denom: denom });
    }
}

export default TokenRepository;
