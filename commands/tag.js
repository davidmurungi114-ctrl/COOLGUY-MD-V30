const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function downloadMediaMessage(message, mediaType) {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const dir = path.join(__dirname, '../temp/');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${Date.now()}.${mediaType}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

async function tagCommand(sock, chatId, senderId, messageText, replyMessage, message) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: '❌ Make bot admin first.\n> © COOLGUY MD V10' }, { quoted: message });
        return;
    }

    if (!isSenderAdmin) {
        const stickerPath = './assets/sticktag.webp';
        if (fs.existsSync(stickerPath)) {
            const stickerBuffer = fs.readFileSync(stickerPath);
            await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this!\n> © COOLGUY MD V10' }, { quoted: message });
        }
        return;
    }

    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants;
    const mentionedJidList = participants.map(p => p.id);

    if (replyMessage) {
        let messageContent = {};
        if (replyMessage.imageMessage) {
            const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
            messageContent = { image: { url: filePath }, caption: messageText || replyMessage.imageMessage.caption || '', mentions: mentionedJidList };
        }
        else if (replyMessage.videoMessage) {
            const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
            messageContent = { video: { url: filePath }, caption: messageText || replyMessage.videoMessage.caption || '', mentions: mentionedJidList };
        }
        else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
            messageContent = { text: replyMessage.conversation || replyMessage.extendedTextMessage.text || messageText, mentions: mentionedJidList };
        }
        else if (replyMessage.documentMessage) {
            const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
            messageContent = { document: { url: filePath }, fileName: replyMessage.documentMessage.fileName, caption: messageText || '', mentions: mentionedJidList };
        }

        if (Object.keys(messageContent).length > 0) {
            await sock.sendMessage(chatId, messageContent);
        }
    } else {
        await sock.sendMessage(chatId, {
            text: `${messageText || "📢 Attention Everyone!"}\n\n> © COOLGUY MD V10`,
            mentions: mentionedJidList
        });
    }
}

module.exports = tagCommand;
