const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

function clearDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            return { success: true, message: `No dir: ${path.basename(dirPath)}`, count: 0 };
        }
        const files = fs.readdirSync(dirPath);
        let deletedCount = 0;
        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file);
                const stat = fs.lstatSync(filePath);
                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
                deletedCount++;
            } catch (err) {
                console.error(`Error deleting file ${file}:`, err);
            }
        }
        return { success: true, message: `Cleared ${deletedCount} files in ${path.basename(dirPath)}`, count: deletedCount };
    } catch (error) {
        return { success: false, message: `Failed: ${path.basename(dirPath)}`, error: error.message };
    }
}

async function clearTmpDirectory() {
    const tmpDir = path.join(process.cwd(), 'tmp');
    const tempDir = path.join(process.cwd(), 'temp');
    const results = [];
    results.push(clearDirectory(tmpDir));
    results.push(clearDirectory(tempDir));
    const totalDeleted = results.reduce((sum, r) => sum + (r.count || 0), 0);
    const message = results.map(r => r.message).join(' | ');
    return { success: true, message, count: totalDeleted };
}

async function clearTmpCommand(sock, chatId, msg) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!' }, { quoted: msg });
            return;
        }

        const result = await clearTmpDirectory();
        await sock.sendMessage(chatId, { text: `✅ ${result.message}\n© COOLGUY MD V10` }, { quoted: msg });

    } catch (error) {
        console.error('Error in cleartmp:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to clear temporary files!' }, { quoted: msg });
    }
}

function startAutoClear() {
    clearTmpDirectory();
    setInterval(async () => { await clearTmpDirectory(); }, 6 * 60 * 60 * 1000);
}

startAutoClear();

module.exports = clearTmpCommand;
