const gameHandler = require('../handlers/gameHandler');
const { isBanned } = require('../utils/banCheck');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;
        
        // Yasaklı kullanıcı kontrolü
        if (await isBanned(message.author.id)) {
            return;
        }
        
        const session = client.gameSessions.get(message.author.id);
        if (session && session.waiting) {
            // Kullanıcının tahmin mesajını session'a kaydet
            session.userGuessMessage = message;
            await gameHandler.handleGuess(message, session, client);
        }
    },
};
