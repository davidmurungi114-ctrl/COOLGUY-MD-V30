const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');

async function setppCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only for Owner!\n> © COOLGUY MD V10' 
            }, { quoted: message });
            return;
        }

        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ Reply to an image with `.setpp`\n> © COOLGUY MD V10' 
            }, { quoted: message });
            return;
        }

        const imageMessage = quotedMessage.imageMessage || quotedMessage.stickerMessage;
        if (!imageMessage) {
            await sock.sendMessage(chatId, { 
                text: '❌ Replied message must contain an image!\n> © COOLGUY MD V10' 
            }, { quoted: message });
            return;
        }

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
        fs.writeFileSync(imagePath, buffer);

        await sock.updateProfilePicture(sock.user.id, { url: imagePath });
        fs.unlinkSync(imagePath);

        await sock.sendMessage(chatId, { 
            text: '✅ *Bot profile picture updated successfully!*\n\n> © COOLGUY MD V10' 
        }, { quoted: message });

    } catch (error) {
        console.error('Error in setpp command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to update profile picture!\n> © COOLGUY MD V10' 
        }, { quoted: message });
    }
}

module.exports = { setppCommand };
