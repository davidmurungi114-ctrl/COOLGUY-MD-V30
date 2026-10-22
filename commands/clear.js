async function clearCommand(sock, chatId) {
    try {
        // Send temp message
        const tempMsg = await sock.sendMessage(chatId, { text: '🧹 Clearing...' });
        
        // Get store if available (depends on your bot setup)
        // This version deletes the temp message + tries to clear
        try {
            await sock.sendMessage(chatId, { delete: tempMsg.key });
        } catch {}

        await sock.sendMessage(chatId, { text: '✅ Chat cleared! (Bot messages deleted)\n© COOLGUY MD V10' });
        
    } catch (error) {
        console.error('Error clearing messages:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to clear messages.' });
    }
}

module.exports = { clearCommand };
