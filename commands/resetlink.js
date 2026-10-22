const isAdmin = require('../lib/isAdmin');

async function resetlinkCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Bot must be admin to reset group link!\n> © COOLGUY MD V10' }, { quoted: message });
            return;
        }

        const newCode = await sock.groupRevokeInvite(chatId);
        
        await sock.sendMessage(chatId, { 
            text: `✅ *Group link reset successfully*\n\n📌 *New link:*\nhttps://chat.whatsapp.com/${newCode}\n\n> © COOLGUY MD V10`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in resetlink command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to reset group link!\n> © COOLGUY MD V10' }, { quoted: message });
    }
}

module.exports = resetlinkCommand;
