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
    const tmpDir = path.join(__dirname, '../temp/');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, `${Date.now()}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'bin'}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

async function hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: '❌ Please make the bot an admin first.' }, { quoted: message });
        return;
    }
    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: '❌ Only admins can use .hidetag.' }, { quoted: message });
        return;
    }

    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants || [];
    const allMentions = participants.map(p => p.id);

    if (replyMessage) {
        let content = {};
        let tmpFile = null;
        try {
            if (replyMessage.imageMessage) {
                tmpFile = await downloadMediaMessage(replyMessage.imageMessage, 'image');
                content = { image: { url: tmpFile }, caption: messageText || replyMessage.imageMessage.caption || '', mentions: allMentions };
            } else if (replyMessage.videoMessage) {
                tmpFile = await downloadMediaMessage(replyMessage.videoMessage, 'video');
                content = { video: { url: tmpFile }, caption: messageText || replyMessage.videoMessage.caption || '', mentions: allMentions };
            } else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
                content = { text: replyMessage.conversation || replyMessage.extendedTextMessage?.text || messageText, mentions: allMentions };
            } else if (replyMessage.documentMessage) {
                tmpFile = await downloadMediaMessage(replyMessage.documentMessage, 'document');
                content = { document: { url: tmpFile }, fileName: replyMessage.documentMessage.fileName, caption: messageText || '', mentions: allMentions };
            }

            if (Object.keys(content).length > 0) {
                await sock.sendMessage(chatId, content);
            }
            if (tmpFile) try { fs.unlinkSync(tmpFile); } catch {}
        } catch (e) {
            console.error(e);
            await sock.sendMessage(chatId, { text: messageText || 'Hidden tag', mentions: allMentions });
        }
    } else {
        if (!messageText) {
            await sock.sendMessage(chatId, { text: 'Usage: .hidetag <message>' }, { quoted: message });
            return;
        }
        await sock.sendMessage(chatId, { text: messageText, mentions: allMentions });
    }
}

module.exports = hideTagCommand;
