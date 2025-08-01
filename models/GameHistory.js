const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    result: {
        type: String,
        enum: ['win', 'lose'],
        required: true
    },
    pointsEarned: {
        type: Number,
        required: true
    },
    attempts: {
        type: Number,
        required: true
    },
    guessTime: {
        type: Number, // milisaniye cinsinden tahmin süresi
        default: 0
    }
}, {
    timestamps: true
});

// Index'ler
gameHistorySchema.index({ userId: 1, createdAt: -1 });
gameHistorySchema.index({ guildId: 1, createdAt: -1 });
gameHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('GameHistory', gameHistorySchema);
