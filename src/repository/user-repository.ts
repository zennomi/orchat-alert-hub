import User from "../model/user";

namespace UserRepository {
    export async function findByChatId(chatId: number) {
        return await User.findOne({ chatId: chatId });
    }

    export async function findAll() {
        return await User.find();
    }


    export async function createUser(
        chatId: number,
        userId: number,
        firstName?: string,
        lastName?: string,
        username?: string,
        languageCode?: string
    ) {
        return await User.create({
            chatId: chatId,
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            username: username,
            languageCode: languageCode,
        });
    }
}

export default UserRepository;
