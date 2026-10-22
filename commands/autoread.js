const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

function initConfig() {
    try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch {
        return { enabled: false };
    }
}

async function autoreadCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'COOLGUY-MD.V10',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        const config = initConfig();
        
        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') config.enabled = true;
            else if (action === 'off' || action === 'disable') config.enabled = false;
            else {
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid option! Use: .autoread on/off\n\n© COOLGUY MD V10',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'COOLGUY-MD.V10',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }
        } else {
            config.enabled = !config.enabled;
        }
        
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        await sock.sendMessage(chatId, {
            text: `✅ Auto-read has been ${config.enabled ? 'enabled ✅' : 'disabled ❌'}!`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'COOLGUY-MD.V10',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in autoread command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error processing command!' }, { quoted: message });
    }
}

function isAutoreadEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch {
        return false;
    }
}

function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) return true;
        }
    }
    
    const textContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) return true;
    }
    
    return false;
}

async function handleAutoread(sock, message) {
    if (isAutoreadEnabled()) {
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        if (isBotMentioned) {
            return false;
        } else {
            const key = { remoteJid: message.key.remoteJid, id: message.key.id, participant: message.key.participant };
            await sock.readMessages([key]);
            return true;
        }
    }
    return false;
}

module.exports = { autoreadCommand, isAutoreadEnabled, isBotMentionedInMessage, handleAutoread };
