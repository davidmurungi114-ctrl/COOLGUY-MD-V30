const os = require('os');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        const sent = await sock.sendMessage(chatId, { text: '🏓 Pong! Checking...' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round(end - start);
        const ram = (os.totalmem() - os.freemem()) / 1024 / 1024;
        const totalRam = os.totalmem() / 1024 / 1024;

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        const botInfo = `
┏━━〔 🔥 𝐂𝐎𝐎𝐋𝐆𝐔𝐘 𝐌𝐃 𝐕𝟏𝟎 〕━━┓
┃ 🚀 *Ping*     : ${ping} ms
┃ ⏱️ *Uptime*   : ${uptimeFormatted}
┃ 💾 *RAM*      : ${ram.toFixed(2)}MB / ${totalRam.toFixed(2)}MB
┃ 🔖 *Version*  : v${settings.version || '10.0.0'}
┃ 👑 *Owner*    : ${settings.botOwner || 'PROFESSOR COOLGUY'}
┗━━━━━━━━━━━━━━━━━━━┛
> © COOLGUY TECH`.trim();

        await sock.sendMessage(chatId, { text: botInfo },{ quoted: message });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' }, { quoted: message });
    }
}

module.exports = pingCommand;
