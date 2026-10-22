const isAdmin = require('../lib/isAdmin');

async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Make bot admin first.\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use .tagall\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ No participants found.\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        let messageText = '🔊 *Hello Everyone:*\n\n';
        participants.forEach(participant => {
            messageText += `@${participant.id.split('@')[0]}\n`;
        });
        messageText += '\n> © COOLGUY MD V10';

        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to tag all.\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = tagAllCommand;
