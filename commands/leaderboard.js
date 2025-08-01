const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createDescriptionLocalizations } = require('../utils/localizationHelper');
const { getLocale, t } = require('../config/i18n');
const { colors } = require('../config/embedConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View leaderboard')
        .setDescriptionLocalizations(createDescriptionLocalizations('leaderboard'))
        .addStringOption(option =>
            option.setName('scope')
                .setDescription('Leaderboard scope')
                .setDescriptionLocalizations(createDescriptionLocalizations('leaderboard_scope'))
                .addChoices(
                    { name: 'Global', value: 'global' },
                    { name: 'Server', value: 'server' }
                )
                .setRequired(true)),
    
    async execute(interaction) {
        try {
            const locale = getLocale(interaction);
            const scope = interaction.options.getString('scope');
            
            const timeSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`leaderboard_time_${scope}`)
                .setPlaceholder(t('leaderboard.select_time', locale))
                .addOptions([
                    {
                        label: t('leaderboard.time.hourly', locale),
                        value: 'hourly',
                        emoji: '⏰'
                    },
                    {
                        label: t('leaderboard.time.daily', locale),
                        value: 'daily',
                        emoji: '📅'
                    },
                    {
                        label: t('leaderboard.time.weekly', locale),
                        value: 'weekly',
                        emoji: '📊'
                    },
                    // {
                    //     label: t('leaderboard.time.monthly', locale),
                    //     value: 'monthly',
                    //     emoji: '📈'
                    // },
                    // {
                    //     label: t('leaderboard.time.yearly', locale),
                    //     value: 'yearly',
                    //     emoji: '🏆'
                    // },
                    // {
                    //     label: t('leaderboard.time.alltime', locale),
                    //     value: 'alltime',
                    //     emoji: '♾️'
                    // }
                ]);

            const row = new ActionRowBuilder().addComponents(timeSelectMenu);

            const embed = new EmbedBuilder()
                .setTitle(t(`leaderboard.title.${scope}`, locale))
                .setDescription(t('leaderboard.select_period', locale))
                .setColor(colors.info);

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        } catch (error) {
            console.error(error);
            const locale = getLocale(interaction);
            await interaction.reply(t('error.general', locale));
        }
    },
};
