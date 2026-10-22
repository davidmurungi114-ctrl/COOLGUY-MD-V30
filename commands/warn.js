const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

function initializeWarningsFile() {
    if (!fs.existsSync(databaseDir)) fs.mkdirSync(databaseDir, { recursive: true });
    if (!fs.existsSync(warningsPath)) fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
}

async function warnCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        initializeWarningsFile();
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ Group only command!\n> © COOLGUY MD V10' });
            return;
        }
        try {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isBotAdmin) { await sock.sendMessage(chatId, { text: '❌ Make bot admin first!\n> © COOLGUY MD V10' }); return; }
            if (!isSenderAdmin) { await sock.sendMessage(chatId, { text: '❌ Only admins can warn!\n> © COOLGUY MD V10' }); return; }
        } catch { await sock.sendMessage(chatId, { text: '❌ Bot must be admin!\n> © COOLGUY MD V10' }); return; }

        let userToWarn;
        if (mentionedJids && mentionedJids.length > 0) userToWarn = mentionedJids[0];
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) userToWarn = message.message.extendedTextMessage.contextInfo.participant;
        
        if (!userToWarn) {
            await sock.sendMessage(chatId, { text: '⚠️ Mention or reply to user to warn!\n> © COOLGUY MD V10' });
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            let warnings = {};
            try { warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8')); } catch { warnings = {}; }
            if (!warnings[chatId]) warnings[chatId] = {};
            if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
            
            warnings[chatId][userToWarn]++;
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

            const warningMessage = `⚠️ *WARNING - COOLGUY MD V10*\n\n👤 Warned: @${userToWarn.split('@')[0]}\n📊 Count: ${warnings[chatId][userToWarn]}/3\n👑 By: @${senderId.split('@')[0]}\n📅 ${new Date().toLocaleString()}\n\n> © COOLGUY MD V10`;

            await sock.sendMessage(chatId, { text: warningMessage, mentions: [userToWarn, senderId] });

            if (warnings[chatId][userToWarn] >= 3) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
                delete warnings[chatId][userToWarn];
                fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
                await sock.sendMessage(chatId, { text: `🚫 *AUTO-KICK - COOLGUY MD V10*\n\n@${userToWarn.split('@')[0]} removed after 3 warnings!\n\n> © COOLGUY MD V10`, mentions: [userToWarn] });
            }
        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Failed to warn!\n> © COOLGUY MD V10' });
        }
    } catch (error) {
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await sock.sendMessage(chatId, { text: '❌ Rate limit! Try again.\n> © COOLGUY MD V10' });
        } else {
            await sock.sendMessage(chatId, { text: '❌ Failed to warn! Check admin perms.\n> © COOLGUY MD V10' });
        }
    }
}

module.exports = warnCommand;
