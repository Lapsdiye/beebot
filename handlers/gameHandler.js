const { EmbedBuilder } = require('discord.js');
const Song = require('../models/Song');
const User = require('../models/User');
const GameHistory = require('../models/GameHistory');
const audioUtils = require('../utils/audioUtils');
const { embedTemplates } = require('../config/embedConfig');
const { getLocale, t } = require('../config/i18n');

async function startGame(interaction, genreId, difficulty, client) {
    try {
        const locale = getLocale(interaction);
        const songs = await Song.find({ genre: genreId });
        if (songs.length === 0) {
            return interaction.update({
                content: t('error.no_songs', locale),
                components: []
            });
        }

        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        const duration = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 5 : 3;

        const preparingMessage = await interaction.update({
            content: t('loading.preparing', locale),
            components: []
        });

        // Audio dosyası oluştur
        const audioPath = await audioUtils.createAudioClip(randomSong.youtubeUrl, duration);
        
        if (!audioPath) {
            return interaction.followUp(t('error.audio_failed', locale));
        }

        // Oyun session'ı oluştur
        client.gameSessions.set(interaction.user.id, {
            song: randomSong,
            attempts: 0,
            maxAttempts: 2,
            waiting: true,
            channelId: interaction.channel.id,
            messageIds: [preparingMessage.id],
            locale: locale,
            difficulty: difficulty,
            startTime: Date.now()
        });

        const embed = embedTemplates.gameStart(duration, interaction.user.username, interaction.user.displayAvatarURL(), locale);

        const gameMessage = await interaction.followUp({
            embeds: [embed],
            files: [{ attachment: audioPath, name: 'guess.mp3' }]
        });

        // Mesaj ID'sini kaydet
        const session = client.gameSessions.get(interaction.user.id);
        session.messageIds.push(gameMessage.id);

        // 2 dakika sonra mesajları sil
        setTimeout(async () => {
            await cleanupGame(interaction.user.id, interaction.channel, client);
        }, 120000); // 2 dakika

        // Audio dosyasını sil
        setTimeout(() => {
            const fs = require('fs');
            fs.unlink(audioPath, () => {});
        }, 1000);

    } catch (error) {
        console.error(error);
        const locale = getLocale(interaction);
        await interaction.followUp(t('error.game_start', locale));
    }
}

async function handleGuess(message, session, client) {
    const guess = message.content.toLowerCase().trim();
    const correctAnswer = session.song.name.toLowerCase();
    const username = message.author.username;
    const avatarUrl = message.author.displayAvatarURL();
    const locale = session.locale || 'en-US';
    const gameStartTime = session.startTime || Date.now();
    const guessTime = Date.now() - gameStartTime;
    
    if (guess === correctAnswer) {
        // Doğru tahmin
        await updateUserScore(message.author.id, 3, true, session.attempts + 1);
        
        // Oyun geçmişini kaydet
        await saveGameHistory(
            message.author.id,
            message.guild.id,
            session.song._id,
            session.difficulty,
            'win',
            3,
            session.attempts + 1,
            guessTime
        );
        
        const embed = embedTemplates.correctGuess(message.author.id, session.song.name, session.song.artist, username, avatarUrl, locale, session.song.youtubeUrl);
        const resultMessage = await message.channel.send({ embeds: [embed] });
        
        // Session'ı hemen temizle
        session.waiting = false;
        
        // 5 saniye sonra tüm oyun mesajlarını sil ve session'ı temizle
        setTimeout(async () => {
            await cleanupGame(message.author.id, message.channel, client);
        }, 5000);
        
    } else {
        session.attempts++;
        
        if (session.attempts >= session.maxAttempts) {
            // Oyun bitti - session'ı hemen temizle
            session.waiting = false;
            await updateUserScore(message.author.id, -2, false, session.attempts);
            
            // Oyun geçmişini kaydet
            await saveGameHistory(
                message.author.id,
                message.guild.id,
                session.song._id,
                session.difficulty,
                'lose',
                -2,
                session.attempts,
                guessTime
            );
            
            const embed = embedTemplates.gameOver(message.author.id, session.song.name, session.song.artist, username, avatarUrl, locale, session.song.youtubeUrl);
            const resultMessage = await message.channel.send({ embeds: [embed] });
            
        } else {
            const remainingAttempts = session.maxAttempts - session.attempts;
            console.log(`Kullanıcı ${username} yanlış tahminde bulundu. Kalan deneme: ${remainingAttempts}`);
            
            const embed = embedTemplates.wrongGuess(message.author.id, remainingAttempts, username, avatarUrl, locale);
            const wrongMessage = await message.channel.send({ embeds: [embed] });
            
            // Yanlış cevap mesajını 3 saniye sonra sil
            // setTimeout(async () => {
            //     try {
            //         await wrongMessage.delete();
            //     } catch (error) {
            //         if (error.code !== 10008) {
            //             console.error('Yanlış cevap mesajı silinirken hata:', error);
            //         }
            //     }
            // }, 3000);
        }
    }
}

async function saveGameHistory(userId, guildId, songId, difficulty, result, pointsEarned, attempts, guessTime) {
    try {
        await GameHistory.create({
            userId,
            guildId,
            songId,
            difficulty,
            result,
            pointsEarned,
            attempts,
            guessTime
        });
    } catch (error) {
        console.error('Oyun geçmişi kaydedilemedi:', error);
    }
}

async function deleteMessage(message, session = null) {
    try {
        await message.delete();
        // Message ID'sini listeden çıkar
        if (session && session.messageIds) {
            const index = session.messageIds.indexOf(message.id);
            if (index > -1) {
                session.messageIds.splice(index, 1);
            }
        }
    } catch (error) {
        if (error.code === 10008) {
            // Mesaj zaten silinmiş, ID'yi listeden çıkar
            if (session && session.messageIds) {
                const index = session.messageIds.indexOf(message.id);
                if (index > -1) {
                    session.messageIds.splice(index, 1);
                }
            }
        } else {
            console.error('Mesaj silinirken hata:', error);
        }
    }
}

async function cleanupGame(userId, channel, client) {
    const session = client.gameSessions.get(userId);
    if (session) {
        // Tüm bot mesajlarını sil
        for (const messageId of session.messageIds) {
            try {
                const message = await channel.messages.fetch(messageId);
                await message.delete();
            } catch (error) {
                if (error.code === 10008) {
                    // Mesaj zaten silinmiş, devam et
                    continue;
                } else {
                    console.error('Cleanup sırasında mesaj silinirken hata:', error);
                }
            }
        }
        
        // Session'ı temizle
        client.gameSessions.delete(userId);
    }
}

async function updateUserScore(userId, points, isWin = false, attempts = 0) {
    try {
        // userId kontrolü
        if (!userId) {
            console.error('userId null veya undefined');
            return;
        }

        const updateData = {
            $inc: { 
                score: points,
                gamesPlayed: 1,
                totalPoints: points > 0 ? points : 0
            }
        };

        if (isWin) {
            updateData.$inc.gamesWon = 1;
            updateData.$inc.correctGuesses = 1;
            updateData.$inc.currentStreak = 1;
        } else {
            updateData.$set = { currentStreak: 0 };
        }

        const user = await User.findOneAndUpdate(
            { discordId: userId },
            updateData,
            { upsert: true, new: true }
        );

        // En iyi streak'i güncelle
        if (user && user.currentStreak > user.bestStreak) {
            await User.updateOne(
                { discordId: userId },
                { $set: { bestStreak: user.currentStreak } }
            );
        }
    } catch (error) {
        console.error('Puan güncelleme hatası:', error);
        console.error('userId:', userId);
    }
}

module.exports = {
    startGame,
    handleGuess,
    updateUserScore
};
