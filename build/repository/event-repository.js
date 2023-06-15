"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = __importDefault(require("../model/event"));
var EventRepository;
(function (EventRepository) {
    async function findByEventId(eventId) {
        return await event_1.default.findOne({ eventId: eventId });
    }
    EventRepository.findByEventId = findByEventId;
    async function findAll() {
        return await event_1.default.find({ notificationStatus: true });
    }
    EventRepository.findAll = findAll;
    async function findByType(eventType) {
        return await event_1.default.find({
            eventType: eventType,
            notificationStatus: true,
        });
    }
    EventRepository.findByType = findByType;
    async function findByWalletAddressAndType(walletAddress, eventType) {
        return await event_1.default.find({
            eventType: eventType,
            "params.walletAddress": walletAddress,
            notificationStatus: true,
        });
    }
    EventRepository.findByWalletAddressAndType = findByWalletAddressAndType;
    async function create(eventId, chatId, eventType, params) {
        return await event_1.default.create(new event_1.default({
            eventId: eventId,
            chatId: chatId,
            eventType: eventType,
            params: params,
        }));
    }
    EventRepository.create = create;
    async function updateNotificationStatus(eventId, notificationStatus) {
        return await event_1.default.updateOne({ eventId: eventId }, { notificationStatus: notificationStatus });
    }
    EventRepository.updateNotificationStatus = updateNotificationStatus;
})(EventRepository || (EventRepository = {}));
exports.default = EventRepository;
