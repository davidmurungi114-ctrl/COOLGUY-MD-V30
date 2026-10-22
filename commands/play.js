const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || '';
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { 
                text: "🎵 *What song do you want to download?*\n\nExample: .play Faded Alan Walker\n> © COOLGUY MD V10"
            }, { quoted: message });
        }

        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "❌ No songs found!"
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `⏳ _Downloading: ${videos[0].title}_\nPlease wait...`
        }, { quoted: message });

        const video = videos[0];
        const urlYt = video.url;

        const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`);
        const data = response.data;

        if (!data || !data.status || !data.result || !data.result.downloadUrl) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Failed to fetch audio. Try another song."
            }, { quoted: message });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title;

        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `*🎵 COOLGUY MD V10 - MUSIC*\n\n*Title:* ${title}\n*Duration:* ${video.timestamp}\n*Views:* ${video.views}\n\n> © COOLGUY TECH - Downloading audio...`
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in play command:', error);
        await sock.sendMessage(chatId, { 
            text: "❌ Download failed. Please try again later."
        }, { quoted: message });
    }
}

module.exports = playCommand;
