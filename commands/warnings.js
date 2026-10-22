const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

function loadWarnings() {
    if (!fs.existsSync(warningsFilePath)) {
        fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
        return {};
    }
    try {
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data) || {};
    } catch { return {}; }
}

async function warningsCommand(sock, chatId, mentionedJidList, message) {
    const warnings = loadWarnings();

    let userToCheck;
    if (mentionedJidList && mentionedJidList.length > 0) userToCheck = mentionedJidList[0];
    else if (message?.message?.extendedTextMessage?.contextInfo?.participant) userToCheck = message.message.extendedTextMessage.contextInfo.participant;

    if (!userToCheck) {
        await sock.sendMessage(chatId, { text: '⚠️ Mention or reply to user to check warnings!\n> © COOLGUY MD V10' });
        return;
    }

    // Support both structures: warnings[chatId][user] and warnings[user]
    let warningCount = 0;
    if (warnings[chatId] && warnings[chatId][userToCheck] !== undefined) warningCount = warnings[chatId][userToCheck];
    else if (warnings[userToCheck] !== undefined) warningCount = warnings[userToCheck];

    await sock.sendMessage(chatId, { 
        text: `⚠️ *WARNINGS - COOLGUY MD V10*\n\n👤 User: @${userToCheck.split('@')[0]}\n📊 Warnings: ${warningCount}/3\n\n${warningCount >= 3 ? '🚫 User will be kicked on next warn!' : `Remaining: ${3 - warningCount}`}\n\n> © COOLGUY MD V10`,
        mentions: [userToCheck]
    });
}

module.exports = warningsCommand;
