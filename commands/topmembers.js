const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveMessageCounts(messageCounts) {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();
    if (!messageCounts[groupId]) messageCounts[groupId] = {};
    if (!messageCounts[groupId][userId]) messageCounts[groupId][userId] = 0;
    messageCounts[groupId][userId] += 1;
    saveMessageCounts(messageCounts);
}

function topMembers(sock, chatId, isGroup) {
    if (!isGroup) {
        sock.sendMessage(chatId, { text: '❌ Group only!\n> © COOLGUY MD V10' });
        return;
    }

    const messageCounts = loadMessageCounts();
    const groupCounts = messageCounts[chatId] || {};
    const sortedMembers = Object.entries(groupCounts).sort(([, a], [, b]) => b - a).slice(0, 10);

    if (sortedMembers.length === 0) {
        sock.sendMessage(chatId, { text: '📊 No activity recorded yet.\n> © COOLGUY MD V10' });
        return;
    }

    let message = '🏆 *TOP MEMBERS - COOLGUY MD V10*\n\n';
    sortedMembers.forEach(([userId, count], index) => {
        message += `${index + 1}. @${userId.split('@')[0]} - ${count} msgs\n`;
    });
    message += '\n> © COOLGUY MD V10';

    sock.sendMessage(chatId, { text: message, mentions: sortedMembers.map(([userId]) => userId) });
}

module.exports = { incrementMessageCount, topMembers };
