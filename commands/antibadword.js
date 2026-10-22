const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'lib', 'antibadword.json');
const warnsPath = path.join(__dirname, '..', 'lib', 'warns.json');

function loadDB() {
    try { if (fs.existsSync(dbPath)) return JSON.parse(fs.readFileSync(dbPath)); } catch {}
    return {};
}
function saveDB(data) {
    try { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); } catch {}
}

const BAD_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'nude', 'porn', 'sex',
    'kuma', 'mavi', 'matako', 'ebolo', 'kebele', 'etako', 'mboro', 'fuck you'
];

async function handleAntiBadwordCommand(sock, chatId, message, q) {
    const db = loadDB();
    const args = (q || "").toLowerCase().trim();

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: "❌ Group only!" }, { quoted: message });
    }

    if (args.includes('delete') && args.includes('on')) {
        db[chatId] = { enabled: true, action: 'delete' };
        saveDB(db);
        return await sock.sendMessage(chatId, { text: `*✅ ANTIBADWORD DELETE ON!*\n\n🛡️ Mode: Delete bad word only\n\n.antibadword kick on - Kick\n.antibadword warn on - 10 warns = kick\n.antibadword off\n\n© COOLGUY MD V10` }, { quoted: message });
    }

    if (args.includes('kick') && args.includes('on')) {
        db[chatId] = { enabled: true, action: 'kick' };
        saveDB(db);
        return await sock.sendMessage(chatId, { text: `*✅ ANTIBADWORD KICK ON!* 🚨\nBad word → Delete + KICK!\n\n© COOLGUY MD V10` }, { quoted: message });
    }

    if (args.includes('warn') && args.includes('on')) {
        db[chatId] = { enabled: true, action: 'warn' };
        saveDB(db);
        return await sock.sendMessage(chatId, { text: `*✅ ANTIBADWORD WARN ON!* ⚠️\n\nMode: Warn 10 times then kick\n1 → 1/10\n...\n10 → KICK!\n\n© COOLGUY MD V10` }, { quoted: message });
    }

    if (args === 'on' || args === '' || args === 'enable') {
        db[chatId] = { enabled: true, action: 'delete' };
        saveDB(db);
        return await sock.sendMessage(chatId, { text: `*✅ ANTIBADWORD ENABLED!*\n\nModes:\n.antibadword delete on\n.antibadword warn on - 10 warns\n.antibadword kick on\n.antibadword off\n\n© COOLGUY MD V10` }, { quoted: message });
    }

    if (args.includes('off') || args.includes('disable')) {
        db[chatId] = { enabled: false };
        saveDB(db);
        return await sock.sendMessage(chatId, { text: "❌ *ANTIBADWORD DISABLED!*" }, { quoted: message });
    }

    return await sock.sendMessage(chatId, { text: `*📖 ANTIBADWORD HELP*\n.antibadword delete on\n.antibadword warn on\n.antibadword kick on\n.antibadword off\n\nCurrent: ${db[chatId]?.enabled ? `ON - ${db[chatId].action}` : 'OFF'}` }, { quoted: message });
}

async function checkAntiBadword(sock, chatId, m) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        const db = loadDB();
        if (!db[chatId]?.enabled) return false;

        const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || "").toLowerCase();
        if (!text) return false;

        const hasBadWord = BAD_WORDS.some(word => text.includes(word));
        if (!hasBadWord) return false;

        await sock.sendMessage(chatId, { delete: m.key });

        const action = db[chatId].action || 'delete';
        let warns = {};
        try { if (fs.existsSync(warnsPath)) warns = JSON.parse(fs.readFileSync(warnsPath)); } catch {}

        const sender = m.key.participant || m.key.remoteJid;

        if (action === 'kick') {
            await sock.sendMessage(chatId, { text: `*🚨 @${sender.split('@')[0]} KICKED!* Reason: Bad word!`, mentions: [sender] });
            await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
        } else if (action === 'warn') {
            warns[chatId] = warns[chatId] || {};
            warns[chatId][sender] = (warns[chatId][sender] || 0) + 1;
            fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));

            if (warns[chatId][sender] >= 10) {
                await sock.sendMessage(chatId, { text: `*🚨 @${sender.split('@')[0]} KICKED after 10 bad words!*`, mentions: [sender] });
                await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
                delete warns[chatId][sender];
                fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
            } else {
                await sock.sendMessage(chatId, { text: `*⚠️ WARNING ${warns[chatId][sender]}/10 @${sender.split('@')[0]}*\n\n❌ No bad words!\n${10 - warns[chatId][sender]} left before kick!`, mentions: [sender] });
            }
        } else {
            await sock.sendMessage(chatId, { text: `*🗑️ DELETED!* @${sender.split('@')[0]} Bad word not allowed!`, mentions: [sender] });
        }
        return true;
    } catch (e) {
        console.log('AntiBadword error:', e.message);
        return false;
    }
}

module.exports = { handleAntiBadwordCommand, checkAntiBadword };
