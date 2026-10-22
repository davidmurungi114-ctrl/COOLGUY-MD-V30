const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

async function unbanCommand(sock, chatId, message) {
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Make bot admin first.\n> © COOLGUY MD V10', ...channelInfo }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can unban!\n> © COOLGUY MD V10', ...channelInfo }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: '❌ Owner only!\n> © COOLGUY MD V10', ...channelInfo }, { quoted: message });
            return;
        }
    }

    let userToUnban;
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }

    if (!userToUnban) {
        await sock.sendMessage(chatId, { text: '⚠️ Mention or reply to user to unban!\n> © COOLGUY MD V10', ...channelInfo }, { quoted: message });
        return;
    }

    try {
        const banPath = path.join(__dirname, '..', 'data', 'banned.json');
        if (!fs.existsSync(banPath)) fs.writeFileSync(banPath, JSON.stringify([], null, 2));
        const bannedUsers = JSON.parse(fs.readFileSync(banPath));
        const index = bannedUsers.indexOf(userToUnban);
        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync(banPath, JSON.stringify(bannedUsers, null, 2));
            await sock.sendMessage(chatId, { text: `✅ *UNBANNED - COOLGUY MD V10*\n\n@${userToUnban.split('@')[0]} has been unbanned!\n\n> © COOLGUY MD V10`, mentions: [userToUnban], ...channelInfo });
        } else {
            await sock.sendMessage(chatId, { text: `ℹ️ @${userToUnban.split('@')[0]} is not banned!\n\n> © COOLGUY MD V10`, mentions: [userToUnban], ...channelInfo });
        }
    } catch (error) {
        await sock.sendMessage(chatId, { text: '❌ Failed to unban!\n> © COOLGUY MD V10', ...channelInfo }, { quoted: message });
    }
}

module.exports = unbanCommand;
