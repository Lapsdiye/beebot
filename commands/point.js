const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/User');
const { embedTemplates } = require('../config/embedConfig');
const { getLocale, t } = require('../config/i18n');
const { createDescriptionLocalizations } = require('../utils/localizationHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('point')
        .setDescription('View your points')
        .setDescriptionLocalizations(createDescriptionLocalizations('point')),
    
    async execute(interaction) {
        try {
            const locale = getLocale(interaction);
            const user = await User.findOne({ discordId: interaction.user.id });
            const score = user ? user.score : 0;
            
            const embed = embedTemplates.userPoints(score, interaction.user.displayAvatarURL(), locale);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const locale = getLocale(interaction);
            await interaction.reply(t('error.general', locale));
        }
    },
};
