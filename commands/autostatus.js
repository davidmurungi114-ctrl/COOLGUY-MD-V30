const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'COOLGUY-MD.V10',
            serverMessageId: -1
        }
    }
};

const configPath = path.join(__dirname, '..', 'data', 'autoStatus.json');

function ensureConfig() {
    try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false, reactOn: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch {
        return { enabled: false, reactOn: false };
    }
}
ensureConfig();

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used by the owner!', ...channelInfo }, { quoted: msg });
            return;
        }

        let config = ensureConfig();

        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled ✅' : 'disabled ❌';
            const reactStatus = config.reactOn ? 'enabled ✅' : 'disabled ❌';
            await sock.sendMessage(chatId, { 
                text: `🔄 *Auto Status Settings*\n\n📱 *Auto Status View:* ${status}\n💫 *Status Reactions:* ${reactStatus}\n\n*Commands:*\n.autostatus on - Enable\n.autostatus off - Disable\n.autostatus react on/off\n\n© COOLGUY MD V10`,
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: '✅ Auto status view enabled!', ...channelInfo }, { quoted: msg });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: '❌ Auto status view disabled!', ...channelInfo }, { quoted: msg });
        } else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { text: '❌ Use: .autostatus react on/off', ...channelInfo }, { quoted: msg });
                return;
            }
            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: '💫 Status reactions enabled!', ...channelInfo }, { quoted: msg });
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: '❌ Status reactions disabled!', ...channelInfo }, { quoted: msg });
            }
        } else {
            await sock.sendMessage(chatId, { text: '❌ Invalid! Use .autostatus on/off', ...channelInfo }, { quoted: msg });
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + error.message, ...channelInfo }, { quoted: msg });
    }
}

function isAutoStatusEnabled() {
    try { return ensureConfig().enabled; } catch { return false; }
}

function isStatusReactionEnabled() {
    try { return ensureConfig().reactOn; } catch { return false; }
}

async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled()) return;
        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
    } catch (error) {
        console.error('Error reacting to status:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) return;
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    }
                }
                return;
            }
        }

        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                await reactToStatus(sock, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                }
            }
            return;
        }

        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                await reactToStatus(sock, status.reaction.key);
            } catch {}
            return;
        }

    } catch (error) {
        console.error('Error in auto status view:', error.message);
    }
}

module.exports = { autoStatusCommand, handleStatusUpdate };
