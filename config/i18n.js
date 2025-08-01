const fs = require('fs');
const path = require('path');

// Dil dosyalarını yükle
const translations = {};
const langFiles = fs.readdirSync('./langs').filter(file => file.endsWith('.json'));

for (const file of langFiles) {
    const langCode = file.replace('.json', '');
    const langPath = path.join('./langs', file);
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    
    // JSON yapısını düz anahtarlara çevir
    const flattenObject = (obj, prefix = '') => {
        const flattened = {};
        for (const key in obj) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(flattened, flattenObject(obj[key], newKey));
            } else {
                flattened[newKey] = obj[key];
            }
        }
        return flattened;
    };
    
    translations[langCode === 'en' ? 'en-US' : langCode] = flattenObject(langData);
}

function getLocale(interaction) {
    const userLocale = interaction.locale;
    
    // Discord locale mapping
    const localeMap = {
        'tr': 'tr',
        'ko': 'ko',
        'en-US': 'en-US',
        'en-GB': 'en-US'
    };
    
    return localeMap[userLocale] || 'en-US'; // Default to English
}

function t(key, locale = 'en-US', params = {}) {
    let text = translations[locale]?.[key] || translations['en-US'][key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return text;
}

module.exports = {
    getLocale,
    t,
    translations
};
