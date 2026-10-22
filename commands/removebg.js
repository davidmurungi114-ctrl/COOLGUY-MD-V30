const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }
    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }
    return null;
}

async function removebgCommand(sock, chatId, message, args) {
    try {
        let imageUrl = null;
        
        if (args && args.length > 0) {
            const url = args.join(' ');
            if (isValidUrl(url)) {
                imageUrl = url;
            } else {
                return sock.sendMessage(chatId, { 
                    text: '❌ Invalid URL.\nUsage: `.removebg https://example.com/image.jpg`\n> © COOLGUY MD V10' 
                }, { quoted: message });
            }
        } else {
            imageUrl = await getQuotedOrOwnImageUrl(sock, message);
            if (!imageUrl) {
                return sock.sendMessage(chatId, { 
                    text: '📸 *COOLGUY RemoveBG*\n\nUsage:\n• `.removebg <image_url>`\n• Reply to an image with `.removebg`\n• Send image with caption `.removebg`\n\n> © COOLGUY MD V10' 
                }, { quoted: message });
            }
        }

        await sock.sendMessage(chatId, { text: '⏳ _Removing background..._\n> © COOLGUY MD V10' }, { quoted: message });

        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.status === 200 && response.data) {
            await sock.sendMessage(chatId, {
                image: response.data,
                caption: '✨ *Background removed successfully!*\n\n> © COOLGUY MD V10'
            }, { quoted: message });
        } else {
            throw new Error('Failed to process image');
        }

    } catch (error) {
        console.error('RemoveBG Error:', error.message);
        let errorMessage = '❌ Failed to remove background.';
        if (error.response?.status === 429) errorMessage = '⏰ Rate limit exceeded. Try later.';
        else if (error.code === 'ECONNABORTED') errorMessage = '⏰ Timeout. Try again.';
        await sock.sendMessage(chatId, { text: `${errorMessage}\n> © COOLGUY MD V10` }, { quoted: message });
    }
}

function isValidUrl(string) {
    try { new URL(string); return true; } catch (_) { return false; }
}

module.exports = { removebgCommand };
