const fetch = require('node-fetch');

async function lyricsCommand(sock, chatId, songTitle, message) {
    if (!songTitle) {
        await sock.sendMessage(chatId, { 
            text: '🔍 *COOLGUY MD V10 LYRICS*\n\nPlease enter the song name!\nUsage: *lyrics <song name>*\nExample: lyrics perfect ed sheeran'
        },{ quoted: message });
        return;
    }

    try {
        const apiUrl = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            const errText = await res.text();
            throw errText;
        }
        
        const data = await res.json();

        const lyrics = data && data.result && data.result.lyrics ? data.result.lyrics : null;
        if (!lyrics) {
            await sock.sendMessage(chatId, {
                text: `❌ Sorry, I couldn't find any lyrics for "${songTitle}".`
            },{ quoted: message });
            return;
        }

        const header = `🎵 *${songTitle.toUpperCase()}* - LYRICS\n*© COOLGUY MD V10*\n\n`;
        const maxChars = 4000 - header.length;
        const outputLyrics = lyrics.length > maxChars ? lyrics.slice(0, maxChars - 3) + '...' : lyrics;
        const output = header + outputLyrics;

        await sock.sendMessage(chatId, { text: output }, { quoted: message });
    } catch (error) {
        console.error('Error in lyrics command:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ An error occurred while fetching the lyrics for "${songTitle}".`
        },{ quoted: message });
    }
}

module.exports = { lyricsCommand };
