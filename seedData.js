require('dotenv').config();
const mongoose = require('mongoose');
const Genre = require('./models/Genre');
const Song = require('./models/Song');

mongoose.connect(process.env.DATABASE_URL);

async function seedData() {
    try {
        // Türleri ekle
        const genres = await Genre.insertMany([
            { name: 'Pop', description: 'Popüler müzik' },
            { name: 'Rock', description: 'Rock müzik' },
            { name: 'Rap', description: 'Rap/Hip-hop müzik' },
            { name: 'Türkçe Pop', description: 'Türkçe pop müzik' }
        ]);

        console.log('Türler eklendi:', genres.length);

        // Örnek şarkılar ekle - güncel ve çalışan YouTube URL'leri
        const songs = [
            {
                name: 'Blinding Lights',
                artist: 'The Weeknd',
                youtubeUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
                genre: genres.find(g => g.name === 'Pop')._id
            },
            {
                name: 'Bohemian Rhapsody',
                artist: 'Queen',
                youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
                genre: genres.find(g => g.name === 'Rock')._id
            },
            {
                name: 'God\'s Plan',
                artist: 'Drake',
                youtubeUrl: 'https://www.youtube.com/watch?v=xpVfcZ0ZcFM',
                genre: genres.find(g => g.name === 'Rap')._id
            },
            {
                name: 'Aşk Laftan Anlamaz',
                artist: 'Buray',
                youtubeUrl: 'https://www.youtube.com/watch?v=YKkIjbJM4FY',
                genre: genres.find(g => g.name === 'Türkçe Pop')._id
            },
            {
                name: 'Watermelon Sugar',
                artist: 'Harry Styles',
                youtubeUrl: 'https://www.youtube.com/watch?v=E07s5ZYygMg',
                genre: genres.find(g => g.name === 'Pop')._id
            }
        ];

        await Song.insertMany(songs);
        console.log('Şarkılar eklendi:', songs.length);

    } catch (error) {
        console.error('Veri ekleme hatası:', error);
    } finally {
        mongoose.disconnect();
    }
}

seedData();
