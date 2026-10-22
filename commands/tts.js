const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

async function ttsCommand(sock, chatId, text, message, language = 'en') {
    if (!text) {
        await sock.sendMessage(chatId, { text: '⚠️ Provide text for TTS!\n> © COOLGUY MD V10', quoted: message });
        return;
    }
    const fileName = `tts-${Date.now()}.mp3`;
    const dir = path.join(__dirname, '..', 'assets');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, fileName);

    const gtts = new gTTS(text, language);
    gtts.save(filePath, async function (err) {
        if (err) {
            await sock.sendMessage(chatId, { text: '❌ TTS Error!\n> © COOLGUY MD V10', quoted: message });
            return;
        }
        await sock.sendMessage(chatId, { audio: { url: filePath }, mimetype: 'audio/mpeg', ptt: false }, { quoted: message });
        try { fs.unlinkSync(filePath); } catch {}
    });
}

module.exports = ttsCommand;
