const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Genre = require('../models/Genre');
const { checkGameChannel } = require('../utils/permissionCheck');
const { getLocale, t } = require('../config/i18n');
const { createDescriptionLocalizations } = require('../utils/localizationHelper');
const { checkBan } = require('../utils/banCheck');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Start music guessing game')
        .setDescriptionLocalizations(createDescriptionLocalizations('guess')),
    
    async execute(interaction) {
        try {
            // Yasaklı kullanıcı kontrolü
            if (await checkBan(interaction)) {
                return;
            }

            const locale = getLocale(interaction);
            
            // Kanal kontrolü
            const canPlay = await checkGameChannel(interaction);
            if (!canPlay) return;

            const genres = await Genre.find();
            if (genres.length === 0) {
                return interaction.reply(t('error.no_genres', locale));
            }

            const options = genres.map(genre => ({
                label: genre.name,
                value: genre._id.toString(),
                description: `${genre.name} ${t('game.genre_suffix', locale, { genre: genre.name })}`
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('genre_select')
                .setPlaceholder(t('game.select_genre', locale))
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                content: t('game.choose_genre', locale),
                components: [row],
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            const locale = getLocale(interaction);
            await interaction.reply(t('error.general', locale));
        }
    },
};
