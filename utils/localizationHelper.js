const fs = require('fs');
const path = require('path');

// Tüm dil dosyalarını yükle
function loadAllLanguages() {
    const langFiles = fs.readdirSync('./langs').filter(file => file.endsWith('.json'));
    const languages = {};
    
    for (const file of langFiles) {
        const langCode = file.replace('.json', '');
        const langPath = path.join('./langs', file);
        languages[langCode] = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    }
    
    return languages;
}

// Discord locale mapping
const discordLocaleMap = {
    'en': 'en-US',
    'tr': 'tr', 
    'ko': 'ko',
    'ja': 'ja'
};

// Komut açıklamaları için localization objesi oluştur
function createDescriptionLocalizations(commandKey) {
    const languages = loadAllLanguages();
    const localizations = {};
    
    for (const [langCode, langData] of Object.entries(languages)) {
        if (langCode === 'en') continue; // İngilizce default olduğu için eklemeye gerek yok
        
        const discordLocale = discordLocaleMap[langCode];
        if (discordLocale && langData.commands?.[commandKey]?.description) {
            localizations[discordLocale] = langData.commands[commandKey].description;
        }
    }
    
    return localizations;
}

// Option açıklamaları için localization objesi oluştur
function createOptionLocalizations(commandKey, optionKey) {
    const languages = loadAllLanguages();
    const localizations = {};
    
    for (const [langCode, langData] of Object.entries(languages)) {
        if (langCode === 'en') continue;
        
        const discordLocale = discordLocaleMap[langCode];
        if (discordLocale && langData.commands?.[commandKey]?.option?.description) {
            localizations[discordLocale] = langData.commands[commandKey].option.description;
        }
    }
    
    return localizations;
}

// Desteklenen dilleri listele
function getSupportedLocales() {
    const languages = loadAllLanguages();
    return Object.keys(languages).map(lang => discordLocaleMap[lang] || lang).filter(Boolean);
}

module.exports = {
    createDescriptionLocalizations,
    createOptionLocalizations,
    getSupportedLocales,
    loadAllLanguages
};
