require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const { isAdmin } = require('./utils/adminCheck');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Game sessions
client.gameSessions = new Map();

// MongoDB bağlantısı
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB bağlandı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Temp klasörü oluştur
if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
}

// Commands yükle
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

// Event handlers yükle
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Slash komutları kaydet
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    
    try {
        // Admin komutlarını sadece admin için kaydet
        const publicCommands = commands.filter(cmd => cmd.name !== 'admin');
        
        // Public komutları tüm sunuculara kaydet
        await rest.put(Routes.applicationCommands(client.user.id), { 
            body: publicCommands 
        });
        
        // Admin komutunu sadece admin kullanıcıya özel kaydet
        const adminCommand = commands.find(cmd => cmd.name === 'admin');
        if (adminCommand) {
            // Admin komutunu global olarak kaydet ama sadece admin görebilir
            await rest.put(Routes.applicationCommands(client.user.id), { 
                body: commands 
            });
        }
        
        console.log('Slash komutları yüklendi');
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.DISCORD_TOKEN);
