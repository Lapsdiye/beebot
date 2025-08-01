# 🎵 BeeBoting - Discord Müzik Tahmin Botu

BeeBoting, Discord sunucularınızda eğlenceli müzik tahmin oyunları düzenleyebileceğiniz bir bot'tur. YouTube'dan müzik çalarak kullanıcıların şarkı adını tahmin etmesini sağlar ve puan sistemi ile rekabetçi bir ortam yaratır.

## ✨ Özellikler

- 🎮 **Müzik Tahmin Oyunu**: YouTube'dan rastgele şarkılar çalarak tahmin oyunu
- 🏆 **Puan Sistemi**: Doğru tahminler için puan kazanma, yanlış tahminler için puan kaybetme
- 📊 **Liderlik Tablosu**: Sunucu içi sıralama sistemi
- 🌐 **Çoklu Dil Desteği**: Türkçe, İngilizce, Japonca ve Korece
- 📱 **Slash Commands**: Modern Discord slash komut sistemi
- 🛡️ **Admin Kontrolleri**: Oyun kanalı ayarlama, kullanıcı yasaklama
- 🎯 **Tür Filtreleme**: Farklı müzik türleri için ayrı oyunlar
- 📈 **Oyun Geçmişi**: Oynanan oyunların kaydı

## 🚀 Kurulum


### Gereksinimler

- Node.js (v16 veya üzeri)
- MongoDB veritabanı
- Discord Bot Token
- FFmpeg

### 1. Projeyi İndirin

```bash
git clone <repository-url>
cd beeboting
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
DISCORD_TOKEN=your_discord_bot_token
DATABASE_URL=your_mongodb_connection_string
ADMIN_USER_ID=your_discord_user_id
```

### 4. Veritabanını Başlatın

```bash
npm run seed
```

### 5. Botu Başlatın

```bash
npm start
```

## 📋 Komutlar

### Kullanıcı Komutları

| Komut | Açıklama |
|-------|----------|
| `/guess` | Müzik tahmin oyunu başlatır |
| `/point` | Mevcut puanınızı gösterir |
| `/leaderboard` | Sunucu liderlik tablosunu gösterir |

### Admin Komutları

| Komut | Açıklama |
|-------|----------|
| `/admin` | Admin panel ve ayarları |
| `/channel` | Oyun kanalını ayarlar |
| `/disable` | Oyunu devre dışı bırakır |

## 🎮 Nasıl Oynanır

1. **Oyun Kanalı Ayarlayın**: Admin olarak `/channel` komutu ile oyun kanalını belirleyin
2. **Oyunu Başlatın**: `/guess` komutu ile oyunu başlatın
3. **Tür Seçin**: Açılan menüden müzik türünü seçin
4. **Şarkıyı Dinleyin**: Bot belirlenen süre boyunca şarkı çalar
5. **Tahmininizi Yapın**: Şarkının adını sohbete yazın
6. **Puan Kazanın**: Doğru tahmin için +3 puan, yanlış için 2 deneme hakkınız var

### Puan Sistemi

- ✅ **Doğru tahmin**: +3 puan
- ❌ **Yanlış tahmin**: 2 deneme hakkı
- 🤔 **Bilememe**: -2 puan
- 🚫 **Zaman aşımı**: -2 puan

## 🛠️ Proje Yapısı

```
beeboting/
├── commands/           # Slash komutları
│   ├── admin.js        # Admin komutları
│   ├── channel.js      # Kanal ayarlama
│   ├── disable.js      # Oyunu devre dışı bırakma
│   ├── guess.js        # Tahmin oyunu
│   ├── leaderboard.js  # Liderlik tablosu
│   └── point.js        # Puan görüntüleme
├── config/             # Yapılandırma dosyaları
│   ├── embedConfig.js  # Embed tasarımları
│   └── i18n.js         # Çoklu dil desteği
├── events/             # Discord olayları
│   ├── interactionCreate.js
│   └── messageCreate.js
├── handlers/           # Oyun işleyicileri
│   ├── gameHandler.js
│   └── leaderboardHandler.js
├── langs/              # Dil dosyaları
│   ├── en.json         # İngilizce
│   ├── ja.json         # Japonca
│   ├── ko.json         # Korece
│   └── tr.json         # Türkçe
├── models/             # MongoDB modelleri
│   ├── BannedUser.js   # Yasaklı kullanıcılar
│   ├── GameHistory.js  # Oyun geçmişi
│   ├── Genre.js        # Müzik türleri
│   ├── Guild.js        # Sunucu ayarları
│   ├── Song.js         # Şarkı bilgileri
│   └── User.js         # Kullanıcı bilgileri
├── utils/              # Yardımcı fonksiyonlar
│   ├── adminCheck.js   # Admin kontrolü
│   ├── audioUtils.js   # Ses işlemleri
│   ├── banCheck.js     # Yasaklı kullanıcı kontrolü
│   ├── canvasUtils.js  # Görsel oluşturma
│   ├── localizationHelper.js # Dil yardımcıları
│   └── permissionCheck.js # İzin kontrolleri
├── temp/               # Geçici dosyalar
├── index.js            # Ana dosya
├── package.json        # Proje bağımlılıkları
└── seedData.js         # Başlangıç verileri
```

## 🔧 Yapılandırma

### Müzik Türleri Ekleme ((/) Komutu olmadan)

MongoDB'ye yeni müzik türleri eklemek için `seedData.js` dosyasını düzenleyin:

```javascript
const genres = [
    { name: 'Pop', nameLocalizations: { tr: 'Pop', en: 'Pop' } },
    { name: 'Rock', nameLocalizations: { tr: 'Rock', en: 'Rock' } },
    // Yeni türler ekleyin...
];
```

### Şarkı Ekleme ((/) Komutu olmadan)

Yeni şarkılar eklemek için `Song` modelini kullanın:

```javascript
const newSong = new Song({
    name: "Şarkı Adı",
    artist: "Sanatçı",
    youtubeUrl: "https://youtube.com/watch?v=...",
    genre: genreId
});
```

## 🌐 Dil Desteği

Bot şu dilleri destekler:

- 🇹🇷 **Türkçe** (tr)
- 🇺🇸 **İngilizce** (en)  
- 🇯🇵 **Japonca** (ja)
- 🇰🇷 **Korece** (ko)

Yeni dil eklemek için `langs/` klasörüne yeni JSON dosyası ekleyin ve `config/i18n.js` dosyasını güncelleyin.

## 🛡️ Güvenlik

- Admin komutları sadece belirlenen admin kullanıcı tarafından kullanılabilir
- Kullanıcı yasaklama sistemi mevcut
- Oyun kanalı kısıtlaması ile spam önlenir
- Rate limiting ile komut spamı engellenir

## 📊 Veritabanı Şeması

### User Model
- Discord ID, kullanıcı adı, puan, oyun sayısı

### Song Model  
- Şarkı adı, sanatçı, YouTube URL, tür

### Guild Model
- Sunucu ayarları, oyun kanalı, dil tercihi

### GameHistory Model
- Oyun geçmişi, oyuncular, sonuçlar

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🐛 Hata Bildirimi

Herhangi bir hata ile karşılaştığınızda, lütfen GitHub Issues bölümünde bildirin.

## 📞 İletişim

Herhangi bir sorunuz veya öneriniz için benimle iletişime geçebilirsiniz.

---

**Not**: Bot'u kullanmadan önce Discord'un Developer Terms of Service'ini okuduğunuzdan emin olun.
