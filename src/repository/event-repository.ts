import Event from "../model/event";

namespace EventRepository {
    export async function findByEventId(eventId: string) {
        return await Event.findOne({ eventId: eventId });
    }

    export async function findAll() {
        return await Event.find({ notificationStatus: true });
    }

    export async function findByType(eventType: string) {
        return await Event.find({
            eventType: eventType,
            notificationStatus: true,
        });
    }
    export async function findByWalletAddressAndType(
        walletAddress: string,
        eventType: string
    ) {
        return await Event.find({
            eventType: eventType,
            "params.walletAddress": walletAddress,
            notificationStatus: true,
        });
    }

    export async function create(
        eventId: string,
        chatId: string,
        eventType: string,
        params: object
    ) {
        return await Event.create(
            new Event({
                eventId: eventId,
                chatId: chatId,
                eventType: eventType,
                params: params,
            })
        );
    }

    export async function updateNotificationStatus(
        eventId: string,
        notificationStatus: boolean
    ) {
        return await Event.updateOne(
            { eventId: eventId },
            { notificationStatus: notificationStatus }
        );
    }
}

export default EventRepository;
