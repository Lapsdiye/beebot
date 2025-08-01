const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const gameHandler = require('../handlers/gameHandler');
const leaderboardHandler = require('../handlers/leaderboardHandler');
const { getLocale, t } = require('../config/i18n');
const { isAdmin } = require('../utils/adminCheck');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            
            
            if (commandName === 'admin' && !isAdmin(interaction.user.id)) {
                return interaction.reply({
                    content: 'Böyle bir komut bulunamadı!',
                    ephemeral: true
                });
            }
            
            const commandFile = require(`../commands/${interaction.commandName}.js`);
            if (commandFile) {
                await commandFile.execute(interaction);
            }
        } else if (interaction.isStringSelectMenu()) {
            await handleSelectMenu(interaction);
        } else if (interaction.isButton()) {
            await handleButton(interaction, client);
        }
    },
};

async function handleSelectMenu(interaction) {
    if (interaction.customId === 'genre_select') {
        const locale = getLocale(interaction);
        const genreId = interaction.values[0];
        
        const difficultyButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`difficulty_easy_${genreId}`)
                    .setLabel(t('game.difficulty_easy', locale))
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`difficulty_medium_${genreId}`)
                    .setLabel(t('game.difficulty_medium', locale))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`difficulty_hard_${genreId}`)
                    .setLabel(t('game.difficulty_hard', locale))
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.update({
            content: t('game.select_difficulty', locale),
            components: [difficultyButtons]
        });
    } else if (interaction.customId.startsWith('leaderboard_time_')) {
        const scope = interaction.customId.split('_')[2];
        const timeframe = interaction.values[0];
        const locale = getLocale(interaction);
        
        await interaction.deferUpdate();
        
        const embed = await leaderboardHandler.createLeaderboardEmbed(
            scope, 
            timeframe, 
            interaction.guild.id, 
            locale, 
            interaction.client
        );
        
        await interaction.editReply({
            embeds: [embed],
            components: []
        });
    }
}

async function handleButton(interaction, client) {
    if (interaction.customId.startsWith('difficulty_')) {
        const [_, difficulty, genreId] = interaction.customId.split('_');
        await gameHandler.startGame(interaction, genreId, difficulty, client);
    }
}
