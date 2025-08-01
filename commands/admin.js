const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkAdminPermission, isAdmin } = require('../utils/adminCheck');
const Song = require('../models/Song');
const Genre = require('../models/Genre');
const BannedUser = require('../models/BannedUser');
const { colors } = require('../config/embedConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin commands')
        .setDefaultMemberPermissions('0') // Hiç kimse göremez
        .addSubcommand(subcommand =>
            subcommand
                .setName('addsong')
                .setDescription('Add a new song')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Song name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('artist')
                        .setDescription('Artist name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('YouTube URL')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('genre')
                        .setDescription('Genre name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removesong')
                .setDescription('Remove a song')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Song name or artist to search')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('addgenre')
                .setDescription('Add a new genre')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Genre name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Genre description')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Ban a user from using the bot')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to ban')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Ban reason')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unban')
                .setDescription('Unban a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to unban')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Bot statistics')),
    
    async execute(interaction) {
        // Admin kontrolü - komut gözükmese bile ekstra güvenlik
        if (!isAdmin(interaction.user.id)) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yetkiniz yok!',
                flags: 64
            });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'addsong':
                await handleAddSong(interaction);
                break;
            case 'removesong':
                await handleRemoveSong(interaction);
                break;
            case 'addgenre':
                await handleAddGenre(interaction);
                break;
            case 'ban':
                await handleBanUser(interaction);
                break;
            case 'unban':
                await handleUnbanUser(interaction);
                break;
            case 'stats':
                await handleStats(interaction);
                break;
        }
    },
};

async function handleAddSong(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const name = interaction.options.getString('name');
    const artist = interaction.options.getString('artist');
    const url = interaction.options.getString('url');
    const genreName = interaction.options.getString('genre');

    try {
        // YouTube URL kontrolü
        if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
            return interaction.editReply({
                content: 'Geçerli bir YouTube URL\'si girin!'
            });
        }

        // Genre bul veya oluştur
        let genre = await Genre.findOne({ name: genreName });
        if (!genre) {
            genre = await Genre.create({
                name: genreName,
                description: `${genreName} müzik türü`
            });
        }

        // Şarkıyı ekle
        const song = await Song.create({
            name,
            artist,
            youtubeUrl: url,
            genre: genre._id
        });

        const embed = new EmbedBuilder()
            .setTitle('✅ Şarkı Eklendi')
            .setDescription(`**${name}** - **${artist}** şarkısı başarıyla eklendi!`)
            .addFields(
                { name: 'Tür', value: genreName, inline: true },
                { name: 'URL', value: `[YouTube](${url})`, inline: true }
            )
            .setColor(colors.success);

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: 'Şarkı eklenirken hata oluştu!'
        });
    }
}

async function handleRemoveSong(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const query = interaction.options.getString('query');

    try {
        const songs = await Song.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { artist: { $regex: query, $options: 'i' } }
            ]
        }).populate('genre');

        if (songs.length === 0) {
            return interaction.editReply({
                content: 'Eşleşen şarkı bulunamadı!'
            });
        }

        if (songs.length === 1) {
            await Song.deleteOne({ _id: songs[0]._id });
            
            const embed = new EmbedBuilder()
                .setTitle('🗑️ Şarkı Silindi')
                .setDescription(`**${songs[0].name}** - **${songs[0].artist}** şarkısı silindi!`)
                .setColor(colors.error);

            await interaction.editReply({ embeds: [embed] });
        } else {
            let description = 'Birden fazla şarkı bulundu:\n\n';
            songs.forEach((song, index) => {
                description += `${index + 1}. **${song.name}** - **${song.artist}** (${song.genre.name})\n`;
            });
            description += '\nLütfen daha spesifik bir arama yapın.';

            const embed = new EmbedBuilder()
                .setTitle('🔍 Çoklu Sonuç')
                .setDescription(description)
                .setColor(colors.warning);

            await interaction.editReply({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: 'Şarkı silinirken hata oluştu!'
        });
    }
}

async function handleAddGenre(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');

    try {
        const existingGenre = await Genre.findOne({ name });
        if (existingGenre) {
            return interaction.editReply({
                content: 'Bu tür zaten mevcut!'
            });
        }

        await Genre.create({ name, description });

        const embed = new EmbedBuilder()
            .setTitle('✅ Tür Eklendi')
            .setDescription(`**${name}** türü başarıyla eklendi!`)
            .addFields({ name: 'Açıklama', value: description })
            .setColor(colors.success);

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: 'Tür eklenirken hata oluştu!'
        });
    }
}

async function handleBanUser(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Sebep belirtilmedi';

    try {
        const existingBan = await BannedUser.findOne({ userId: user.id });
        if (existingBan) {
            return interaction.editReply({
                content: 'Bu kullanıcı zaten yasaklı!'
            });
        }

        await BannedUser.create({
            userId: user.id,
            reason,
            bannedBy: interaction.user.id
        });

        const embed = new EmbedBuilder()
            .setTitle('🔨 Kullanıcı Yasaklandı')
            .setDescription(`**${user.username}** bot kullanımından yasaklandı!`)
            .addFields({ name: 'Sebep', value: reason })
            .setColor(colors.error);

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: 'Kullanıcı yasaklanırken hata oluştu!'
        });
    }
}

async function handleUnbanUser(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const user = interaction.options.getUser('user');

    try {
        const ban = await BannedUser.findOneAndDelete({ userId: user.id });
        if (!ban) {
            return interaction.editReply({
                content: 'Bu kullanıcı yasaklı değil!'
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('✅ Yasak Kaldırıldı')
            .setDescription(`**${user.username}** artık botu kullanabilir!`)
            .setColor(colors.success);

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: 'Yasak kaldırılırken hata oluştu!'
        });
    }
}

async function handleStats(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const totalSongs = await Song.countDocuments();
        const totalGenres = await Genre.countDocuments();
        const totalBanned = await BannedUser.countDocuments();

        const embed = new EmbedBuilder()
            .setTitle('📊 Bot İstatistikleri')
            .addFields(
                { name: '🎵 Toplam Şarkı', value: totalSongs.toString(), inline: true },
                { name: '🎭 Toplam Tür', value: totalGenres.toString(), inline: true },
                { name: '🔨 Yasaklı Kullanıcı', value: totalBanned.toString(), inline: true }
            )
            .setColor(colors.info)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: 'İstatistikler alınırken hata oluştu!'
        });
    }
}
