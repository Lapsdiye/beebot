const BannedUser = require('../models/BannedUser');

async function isBanned(userId) {
    try {
        const ban = await BannedUser.findOne({ userId });
        return ban !== null;
    } catch (error) {
        console.error('Ban kontrolü hatası:', error);
        return false;
    }
}

async function checkBan(interaction) {
    const banned = await isBanned(interaction.user.id);
    if (banned) {
        await interaction.reply({
            content: '❌ Bot kullanımından yasaklandınız!',
            ephemeral: true
        });
        return true;
    }
    return false;
}

module.exports = {
    isBanned,
    checkBan
};
