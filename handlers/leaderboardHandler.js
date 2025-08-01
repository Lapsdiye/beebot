const { EmbedBuilder } = require('discord.js');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');
const { colors } = require('../config/embedConfig');
const { t } = require('../config/i18n');

async function generateLeaderboard(scope, timeframe, guildId, locale) {
    try {
        let timeFilter = {};
        const now = new Date();
        
        // Zaman filtresini ayarla
        switch (timeframe) {
            case 'hourly':
                timeFilter = { createdAt: { $gte: new Date(now - 60 * 60 * 1000) } };
                break;
            case 'daily':
                timeFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
                break;
            case 'weekly':
                timeFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case 'monthly':
                timeFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
                break;
            case 'yearly':
                timeFilter = { createdAt: { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) } };
                break;
            case 'alltime':
                // Tüm zamanlar için filtre yok
                break;
        }

        // Scope filtresini ayarla
        let scopeFilter = {};
        if (scope === 'server') {
            scopeFilter = { guildId: guildId };
        }

        // Kullanıcı istatistiklerini topla
        const pipeline = [
            {
                $match: { ...timeFilter, ...scopeFilter }
            },
            {
                $group: {
                    _id: '$userId',
                    totalPoints: { $sum: '$pointsEarned' },
                    gamesPlayed: { $sum: 1 },
                    gamesWon: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
                    avgGuessTime: { $avg: '$guessTime' }
                }
            },
            {
                $addFields: {
                    winRate: { $divide: ['$gamesWon', '$gamesPlayed'] }
                }
            },
            {
                $sort: { totalPoints: -1 }
            },
            {
                $limit: 10
            }
        ];

        const leaderboardData = await GameHistory.aggregate(pipeline);
        
        return leaderboardData;
    } catch (error) {
        console.error('Leaderboard oluşturma hatası:', error);
        return [];
    }
}

async function createLeaderboardEmbed(scope, timeframe, guildId, locale, client) {
    const leaderboardData = await generateLeaderboard(scope, timeframe, guildId, locale);
    
    const embed = new EmbedBuilder()
        .setTitle(t(`leaderboard.title.${scope}`, locale) + ' - ' + t(`leaderboard.time.${timeframe}`, locale))
        .setColor(colors.info)
        .setTimestamp();

    if (leaderboardData.length === 0) {
        embed.setDescription(t('leaderboard.no_data', locale));
        return embed;
    }

    let description = '';
    for (let i = 0; i < leaderboardData.length; i++) {
        const data = leaderboardData[i];
        let user;
        
        try {
            user = await client.users.fetch(data._id);
        } catch {
            user = { username: t('leaderboard.unknown_user', locale) };
        }
        
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const winRate = Math.round(data.winRate * 100);
        const avgTime = Math.round(data.avgGuessTime / 1000);
        
        description += `${medal} **${user.username}**\n`;
        description += `   📊 ${data.totalPoints} ${t('leaderboard.points', locale)} | `;
        description += `🎮 ${data.gamesPlayed} ${t('leaderboard.games', locale)} | `;
        description += `🏆 ${winRate}% ${t('leaderboard.winrate', locale)}\n\n`;
    }

    embed.setDescription(description);
    return embed;
}

module.exports = {
    generateLeaderboard,
    createLeaderboardEmbed
};
