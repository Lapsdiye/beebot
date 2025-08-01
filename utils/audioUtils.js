const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function createAudioClip(youtubeUrl, duration) {
    try {
        // URL validation
        const isValid = await ytdl.validateURL(youtubeUrl);
        if (!isValid) {
            throw new Error('Geçersiz YouTube URL');
        }

        // Yeni agent ile ytdl-core başlat
        const agent = ytdl.createAgent();
        
        const info = await ytdl.getInfo(youtubeUrl, { agent });
        const audioFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highestaudio',
            filter: 'audioonly'
        });
        
        if (!audioFormat) {
            console.error('Audio format bulunamadı');
            return null;
        }
        
        const outputPath = path.join('./temp', `${Date.now()}.mp3`);
        const videoDuration = parseInt(info.videoDetails.lengthSeconds);
        const maxStartTime = Math.max(10, videoDuration - duration - 10);
        const startTime = Math.floor(Math.random() * maxStartTime);

        return new Promise((resolve, reject) => {
            const ffmpegProcess = spawn(ffmpeg, [
                '-i', audioFormat.url,
                '-ss', startTime.toString(),
                '-t', duration.toString(),
                '-acodec', 'libmp3lame',
                '-ar', '44100',
                '-b:a', '128k',
                '-y',
                outputPath
            ], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let errorOutput = '';
            
            ffmpegProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            ffmpegProcess.on('close', (code) => {
                if (code === 0 && fs.existsSync(outputPath)) {
                    resolve(outputPath);
                } else {
                    console.error('FFmpeg error:', errorOutput);
                    reject(new Error(`FFmpeg failed with code ${code}`));
                }
            });

            ffmpegProcess.on('error', (error) => {
                console.error('FFmpeg spawn error:', error);
                reject(error);
            });

            // 30 saniye timeout
            setTimeout(() => {
                ffmpegProcess.kill();
                reject(new Error('FFmpeg timeout'));
            }, 30000);
        });
    } catch (error) {
        console.error('Audio clip oluşturma hatası:', error);
        return null;
    }
}

module.exports = {
    createAudioClip
};
