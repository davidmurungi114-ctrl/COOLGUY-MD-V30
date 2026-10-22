async function unmuteCommand(sock, chatId, senderId, message) {
    try {
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, { text: '🔊 *Group Unmuted! - COOLGUY MD V10*\n\nAll members can now send messages.\n\n> © COOLGUY MD V10' }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to unmute group!\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = unmuteCommand;
