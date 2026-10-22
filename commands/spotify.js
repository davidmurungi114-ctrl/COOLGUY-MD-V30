const axios = require('axios');

async function spotifyCommand(sock, chatId, message) {
    try {
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        const used = (rawText || '').split(/\s+/)[0] || '.spotify';
        const query = rawText.slice(used.length).trim();

        if (!query) {
            await sock.sendMessage(chatId, { text: '⚠️ Usage: `.spotify <song name>`\nEx: `.spotify con calma`\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { text: `🎧 *Searching Spotify for:* _${query}_\n\n⏳ Please wait...\n\n> © COOLGUY MD V10` }, { quoted: message });

        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, { timeout: 20000, headers: { 'user-agent': 'Mozilla/5.0' } });

        if (!data?.status || !data?.result) throw new Error('No result from Spotify API');

        const r = data.result;
        const audioUrl = r.audio;
        if (!audioUrl) {
            await sock.sendMessage(chatId, { text: '❌ No downloadable audio found.\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        const caption = `🎵 *COOLGUY SPOTIFY*\n\n*Title:* ${r.title || r.name || 'Unknown'}\n*Artist:* ${r.artist || 'Unknown'}\n*Duration:* ${r.duration || 'N/A'}\n*Link:* ${r.url || ''}\n\n> © COOLGUY MD V10`.trim();

         if (r.thumbnails) {
            await sock.sendMessage(chatId, { image: { url: r.thumbnails }, caption }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: caption }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${(r.title || r.name || 'track').replace(/[\\/:*?"<>|]/g, '')}.mp3`
        }, { quoted: message });

    } catch (error) {
        console.error('[SPOTIFY] error:', error?.message || error);
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch Spotify audio. Try another query.\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = spotifyCommand;
