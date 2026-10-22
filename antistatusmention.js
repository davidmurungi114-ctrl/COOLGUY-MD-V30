const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../lib/antistatusmention.json');
function loadDB() {
    try { if (fs.existsSync(dbPath)) { return JSON.parse(fs.readFileSync(dbPath)); } } catch {}
    return {};
}
function saveDB(data) {
    try { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); } catch {}
}
async function antistatusmentionCommand(sock, chatId, message, q) {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) { return await sock.sendMessage(chatId, { text: "❌ Group only!" }); }
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const senderId = message.key.participant || message.key.remoteJid;
        const sender = participants.find(p => p.id === senderId);
        if (!sender?.admin && !message.key.fromMe) { return await sock.sendMessage(chatId, { text: "❌ Only admins!" }); }
        let db = loadDB();
        const args = (q || "").toLowerCase().trim();
        if (args.includes('delete') && args.includes('on')) {
            db[chatId] = { enabled: true, action: 'delete' };
            saveDB(db);
            return await sock.sendMessage(chatId, { text: `*✅ ANTISTATUS DELETE MODE ON!*\n\n🛡️ Mode: Delete only\nStatus → Delete\n\nCommands:\n.antistatusmention kick on\n.antistatusmention warn on\n.antistatusmention off\n\n© COOLGUY MD V10` });
        }
        if (args.includes('kick') && args.includes('on')) {
            db[chatId] = { enabled: true, action: 'kick' };
            saveDB(db);
            return await sock.sendMessage(chatId, { text: `*✅ ANTISTATUS KICK MODE ON!* 🚨\n\n🛡️ Mode: Kick directly\nStatus → Delete + KICK!\n\n© COOLGUY MD V10` });
        }
        if (args.includes('warn') && args.includes('on')) {
            db[chatId] = { enabled: true, action: 'warn' };
            saveDB(db);
            return await sock.sendMessage(chatId, { text: `*✅ ANTISTATUS WARN MODE ON!* ⚠️\n\n🛡️ Mode: Warn 10 times then kick\n1st → Warn 1/10\n...\n10th → KICK!\n\n© COOLGUY MD V10` });
        }
        if (args === 'on' || args === 'delete' || args === '' || args === 'enable') {
            db[chatId] = { enabled: true, action: 'delete' };
            saveDB(db);
            return await sock.sendMessage(chatId, { text: `*✅ ANTISTATUS ENABLED!*\n\n🛡️ Will DELETE status forwarded to group\n✅ Allows normal @mentions\n\nModes:\n.antistatusmention delete on\n.antistatusmention warn on - 10 warns = kick\n.antistatusmention kick on\n.antistatusmention off\n\n© COOLGUY MD V10` });
        }
        if (args.includes('off') || args.includes('disable')) {
            db[chatId] = { enabled: false };
            saveDB(db);
            return await sock.sendMessage(chatId, { text: "❌ *ANTISTATUS DISABLED!*" });
        }
        return await sock.sendMessage(chatId, { text: `*📖 HELP*\n.antistatusmention delete on\n.antistatusmention warn on\n.antistatusmention kick on\n.antistatusmention off\n\nCurrent: ${db[chatId]?.enabled ? `ON - ${db[chatId].action}` : 'OFF'}` });
    } catch (e) {
        console.log(e);
        await sock.sendMessage(chatId, { text: "Error: " + e.message });
    }
}
async function checkAntiStatusMention(sock, chatId, m) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        let db = loadDB();
        if (!db[chatId]?.enabled) return false;
        const msg = m.message;
        if (!msg) return false;
        const contextInfo = msg.extendedTextMessage?.contextInfo || msg.imageMessage?.contextInfo || msg.videoMessage?.contextInfo || {};
        const isForwarded = contextInfo.isForwarded === true;
        const forwardingScore = contextInfo.forwardingScore || 0;
        const isStatusForward = isForwarded && forwardingScore > 0;
        if (isStatusForward) {
            await sock.sendMessage(chatId, { delete: m.key });
            const action = db[chatId].action || 'delete';
            const warnPath = path.join(__dirname, '../lib/warns.json');
            let warns = {};
            try { if (fs.existsSync(warnPath)) warns = JSON.parse(fs.readFileSync(warnPath)); } catch {}
            const sender = m.key.participant || m.key.remoteJid;
            if (action === 'kick') {
                await sock.sendMessage(chatId, { text: `*🚨 @${sender.split('@')[0]} KICKED!* Reason: Status not allowed!`, mentions: [sender] });
                await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
            } else if (action === 'warn') {
                warns[chatId] = warns[chatId] || {};
                warns[chatId][sender] = (warns[chatId][sender] || 0) + 1;
                fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));
                if (warns[chatId][sender] >= 10) {
                    await sock.sendMessage(chatId, { text: `*🚨 @${sender.split('@')[0]} KICKED after 10 warnings!* Reason: 10x Status spam!`, mentions: [sender] });
                    await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
                    delete warns[chatId][sender];
                    fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));
                } else {
                    await sock.sendMessage(chatId, { text: `*⚠️ WARNING ${warns[chatId][sender]}/10 @${sender.split('@')[0]}*\n\n❌ Don't forward Status to group!\n✅ Normal @mentions allowed!\n\n${10 - warns[chatId][sender]} warns left before kick!`, mentions: [sender] });
                }
            } else {
                await sock.sendMessage(chatId, { text: `*🗑️ DELETED!* @${sender.split('@')[0]} Status not allowed!`, mentions: [sender] });
            }
            return true;
        }
        return false;
    } catch (e) {
        console.log('AntiStatus Error:', e.message);
        return false;
    }
}
module.exports = antistatusmentionCommand;
module.exports.checkAntiStatusMention = checkAntiStatusMention;
