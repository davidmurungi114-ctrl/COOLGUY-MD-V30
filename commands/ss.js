const fetch = require('node-fetch');

async function ssCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const match = text.split(' ').slice(1).join(' ').trim();

        if (!match) {
            await sock.sendMessage(chatId, {
                text: `*📸 COOLGUY SCREENSHOT TOOL*\n\n*.ss <url>*\n*.ssweb <url>*\n*.screenshot <url>*\n\nTake screenshot of any website\n\nEx:\n.ss https://google.com\n\n> © COOLGUY MD V10`
            }, { quoted: message });
            return;
        }

        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);

        const url = match.trim();
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            await sock.sendMessage(chatId, {
                text: '❌ Provide valid URL starting with http:// or https://\n> © COOLGUY MD V10'
            }, { quoted: message });
            return;
        }

        const apiUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(url)}&theme=light&device=desktop`;
        const response = await fetch(apiUrl, { headers: { 'accept': '*/*' } });
        
        if (!response.ok) throw new Error(`API status: ${response.status}`);

        const imageBuffer = await response.buffer();

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `✅ *Screenshot captured!*\n🌐 ${url}\n\n> © COOLGUY MD V10`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in ss command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to take screenshot. Try again later.\nPossible: Invalid URL / Site blocking / API down\n\n> © COOLGUY MD V10'
        }, { quoted: message });
    }
}

module.exports = ssCommand;
