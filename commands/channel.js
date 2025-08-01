const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const { colors } = require('../config/embedConfig');
const { getLocale, t } = require('../config/i18n');
const { createDescriptionLocalizations, createOptionLocalizations } = require('../utils/localizationHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Set channel for music guessing game')
        .setDescriptionLocalizations(createDescriptionLocalizations('channel'))
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Channel where the game will be played')
                .setDescriptionLocalizations(createOptionLocalizations('channel'))
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        try {
            const locale = getLocale(interaction);
            const channel = interaction.options.getChannel('kanal');
            
            if (channel.type !== 0) { // 0 = GUILD_TEXT
                return interaction.reply({
                    content: t('channel.wrong_type', locale),
                    ephemeral: true
                });
            }

            await Guild.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { 
                    gameChannelId: channel.id,
                    isEnabled: true
                },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setTitle(t('channel.set.title', locale))
                .setDescription(t('channel.set.description', locale, { channel }))
                .setColor(colors.success)
                .setFooter({ 
                    text: t('setup.footer.set', locale, { username: interaction.user.username }), 
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
