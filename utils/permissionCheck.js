const Guild = require('../models/Guild');
const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config/embedConfig');
const { getLocale, t } = require('../config/i18n');

async function checkGameChannel(interaction) {
    try {
        const locale = getLocale(interaction);
        const guildSettings = await Guild.findOne({ guildId: interaction.guild.id });
        
        if (!guildSettings || !guildSettings.isEnabled) {
            const embed = new EmbedBuilder()
                .setTitle(t('channel.game_disabled', locale).split('.')[0])
                .setDescription(t('channel.game_disabled', locale))
                .setColor(colors.error);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }

        if (guildSettings.gameChannelId && interaction.channel.id !== guildSettings.gameChannelId) {
            const gameChannel = interaction.guild.channels.cache.get(guildSettings.gameChannelId);
            const embed = new EmbedBuilder()
                .setTitle(t('channel.wrong_channel', locale, { channel: gameChannel }).split('.')[0])
                .setColor(colors.warning);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }

        return true;
    } catch (error) {
        console.error('Kanal kontrolü hatası:', error);
        return false;
    }
}

module.exports = {
    checkGameChannel
};
