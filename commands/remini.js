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

async function reminiCommand(sock, chatId, message, args) {
    try {
        let imageUrl = null;
        
        if (args && args.length > 0) {
            const url = args.join(' ');
            if (isValidUrl(url)) {
                imageUrl = url;
            } else {
                return sock.sendMessage(chatId, { 
                    text: '❌ Invalid URL.\nUsage: `.remini https://example.com/image.jpg`\n> © COOLGUY MD V10' 
                }, { quoted: message });
            }
        } else {
            imageUrl = await getQuotedOrOwnImageUrl(sock, message);
            
            if (!imageUrl) {
                return sock.sendMessage(chatId, { 
                    text: '📸 *COOLGUY HD - Remini AI*\n\nUsage:\n• `.remini <image_url>`\n• Reply to an image with `.remini`\n• Send image with caption `.remini`\n\n> © COOLGUY MD V10' 
                }, { quoted: message });
            }
        }

        await sock.sendMessage(chatId, { text: '⏳ _Enhancing image, please wait..._\n> © COOLGUY MD V10' }, { quoted: message });

        const apiUrl = `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 60000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.data && response.data.success && response.data.result) {
            const result = response.data.result;
            if (result.image_url) {
                const imageResponse = await axios.get(result.image_url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                if (imageResponse.status === 200 && imageResponse.data) {
                    await sock.sendMessage(chatId, {
                        image: imageResponse.data,
                        caption: '✨ *Image enhanced successfully!*\n\n> © COOLGUY MD V10 - ENHANCED'
                    }, { quoted: message });
                } else {
                    throw new Error('Failed to download enhanced image');
                }
            } else {
                throw new Error(result.message || 'Failed to enhance image');
            }
        } else {
            throw new Error('API returned invalid response');
        }
    } catch (error) {
        console.error('Remini Error:', error.message);
        let errorMessage = '❌ Failed to enhance image.';
        if (error.response?.status === 429) errorMessage = '⏰ Rate limit exceeded. Try later.';
        else if (error.response?.status === 500) errorMessage = '🔧 Server error. Try later.';
        else if (error.code === 'ECONNABORTED') errorMessage = '⏰ Request timeout. Try again.';
        await sock.sendMessage(chatId, { text: `${errorMessage}\n> © COOLGUY MD V10` }, { quoted: message });
    }
}

function isValidUrl(string) {
    try { new URL(string); return true; } catch (_) { return false; }
}

module.exports = { reminiCommand };
