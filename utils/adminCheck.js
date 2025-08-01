const ADMIN_USER_ID = '983441734954545262';

function isAdmin(userId) {
    return userId === ADMIN_USER_ID;
}

async function checkAdminPermission(interaction) {
    if (!isAdmin(interaction.user.id)) {
        await interaction.reply({
            content: 'Bu komutu kullanmak için yetkiniz yok!',
            ephemeral: true
        });
        return false;
    }
    return true;
}

module.exports = {
    isAdmin,
    checkAdminPermission,
    ADMIN_USER_ID
};
