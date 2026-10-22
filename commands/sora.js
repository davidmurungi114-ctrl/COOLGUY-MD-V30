const axios = require('axios');

async function soraCommand(sock, chatId, message) {
    try {
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        const used = (rawText || '').split(/\s+/)[0] || '.sora';
        const args = rawText.slice(used.length).trim();
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const input = args || quotedText;

        if (!input) {
            await sock.sendMessage(chatId, { text: '⚠️ Provide a prompt.\nEx: `.sora anime girl with short blue hair`\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { text: `🎬 *Generating Sora video for:*\n_${input}_\n\n⏳ Please wait...\n\n> © COOLGUY MD V10` }, { quoted: message });

        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(input)}`;
        const { data } = await axios.get(apiUrl, { timeout: 60000, headers: { 'user-agent': 'Mozilla/5.0' } });

        const videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;
        if (!videoUrl) throw new Error('No videoUrl in API response');

        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `🎥 *SORA AI VIDEO*\n\nPrompt: ${input}\n\n> © COOLGUY MD V10`
        }, { quoted: message });

    } catch (error) {
        console.error('[SORA] error:', error?.message || error);
        await sock.sendMessage(chatId, { text: '❌ Failed to generate video. Try different prompt later.\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = soraCommand;
