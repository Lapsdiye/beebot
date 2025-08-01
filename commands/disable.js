const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const { colors } = require('../config/embedConfig');
const { getLocale, t } = require('../config/i18n');
const { createDescriptionLocalizations } = require('../utils/localizationHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable')
        .setDescription('Disable music guessing game')
        .setDescriptionLocalizations(createDescriptionLocalizations('disable'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        try {
            const locale = getLocale(interaction);
            
            await Guild.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { 
                    gameChannelId: null,
                    isEnabled: false
                },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setTitle(t('channel.disable.title', locale))
                .setDescription(t('channel.disable.description', locale))
                .setColor(colors.error)
                .setFooter({ 
                    text: t('setup.footer.disabled', locale, { username: interaction.user.username }), 
                    iconURL: interaction.user.displayAvatarURL() 
                });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const locale = getLocale(interaction);
            await interaction.reply({
                content: t('error.general', locale),
                ephemeral: true
            });
        }
    },
};
