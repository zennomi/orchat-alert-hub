"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../model/user"));
var UserRepository;
(function (UserRepository) {
    async function findByChatId(chatId) {
        return await user_1.default.findOne({ chatId: chatId });
    }
    UserRepository.findByChatId = findByChatId;
    async function findAll() {
        return await user_1.default.find();
    }
    UserRepository.findAll = findAll;
    async function createUser(chatId, userId, firstName, lastName, username, languageCode) {
        return await user_1.default.create({
            chatId: chatId,
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            username: username,
            languageCode: languageCode,
        });
    }
    UserRepository.createUser = createUser;
})(UserRepository || (UserRepository = {}));
exports.default = UserRepository;
