const { EmbedBuilder } = require('discord.js');
const { t } = require('./i18n');

const colors = {
    primary: '#0099ff',
    success: '#00ff00',
    error: '#ff0000',
    warning: '#ffaa00',
    info: '#17a2b8'
};

const embedTemplates = {
    gameStart: (duration, username, avatarUrl, locale) => new EmbedBuilder()
        .setTitle(t('game.title', locale))
        .setDescription(t('game.description', locale, { duration }))
        .setColor(colors.primary)
        .setFooter({ text: t('footer.playing', locale, { username }), iconURL: avatarUrl }),

    correctGuess: (userId, songName, artist, username, avatarUrl, locale, youtubeUrl) => new EmbedBuilder()
        .setTitle(t('game.correct.title', locale))
        .setDescription(t('game.correct.description', locale, { userId, songName, artist }) + `\n\n🎵 [${t('game.listen_song', locale)}](${youtubeUrl})`)
        .setColor(colors.success)
        .setFooter({ text: t('footer.correct', locale, { username }), iconURL: avatarUrl }),

    wrongGuess: (userId, remainingAttempts, username, avatarUrl, locale) => new EmbedBuilder()
        .setTitle(t('game.wrong.title', locale))
        .setDescription(t('game.wrong.description', locale, { userId, remainingAttempts }))
        .setColor(colors.warning)
        .setFooter({ text: t('footer.wrong', locale, { username }), iconURL: avatarUrl }),

    gameOver: (userId, songName, artist, username, avatarUrl, locale, youtubeUrl) => new EmbedBuilder()
        .setTitle(t('game.over.title', locale))
        .setDescription(t('game.over.description', locale, { userId, songName, artist }) + `\n\n🎵 [${t('game.listen_song', locale)}](${youtubeUrl})`)
        .setColor(colors.error)
        .setFooter({ text: t('footer.failed', locale, { username }), iconURL: avatarUrl }),

    userPoints: (score, avatarUrl, locale) => new EmbedBuilder()
        .setTitle(t('points.title', locale))
        .setDescription(t('points.description', locale, { score }))
        .setColor(colors.info)
        .setThumbnail(avatarUrl)
};

module.exports = {
    colors,
    embedTemplates
};
