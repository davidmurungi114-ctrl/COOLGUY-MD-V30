const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    const PIC = 'https://raw.githubusercontent.com/davidmurungi114-ctrl/COOLGUY-MD.V10/refs/heads/main/assets/IMG-20261019-WA8138.jpg';
    const PAIR_SITE = 'https://coolguy-md-v10-pair.onrender.com';

    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                image: { url: PIC },
                caption: `*╭━〘 COOLGUY MD V10 〙━⊷*\n*┃* 🔥 Professor Coolguy - Pair Site\n*╰━━━━━━━━━━━━━━━⊷*\n\n*🌐 YOUR PAIR SITE:*\n${PAIR_SITE}\n\n*📲 HOW TO GET CODE:*\n1. Tap link above ☝️\n2. Enter number 256...\n3. Select SERVER 01/02/03\n4. Click Generate LIVE BOT Code\n5. Link in WhatsApp → Type .menu\n\n*💡 OR type: .pair 2567xxxxxx*\n\n*© 2026 COOLGUY MD V10 LIVE*`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'COOLGUY MD V10',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        const numbers = q.split(',')
            .map((v) => v.replace(/[^0-9]/g, ''))
            .filter((v) => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid number! Use: .pair 2567xxxxxx\n\nOr just type .pair to get link!",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'COOLGUY MD V10',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        for (const number of numbers) {
            await sock.sendMessage(chatId, {
                text: `⏳ *Generating code for ${number}...*\n\n🌐 *Direct Link:* ${PAIR_SITE}\n\nWait 10 sec...`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: 'COOLGUY MD V10',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });

            try {
                const response = await axios.get(`${PAIR_SITE}/pair?number=${number}&server=1&mode=live`);
                
                if (response.data && response.data.code) {
                    const code = response.data.code;
                    if (code === "Service Unavailable") {
                        throw new Error('Service Unavailable');
                    }
                    
                    await sleep(2000);
                    await sock.sendMessage(chatId, {
                        image: { url: PIC },
                        caption: `*✅ COOLGUY PAIR CODE READY!*\n\n*🔢 CODE: ${code}*\n*📱 NUMBER: ${number}*\n\n*📲 STEPS:*\n1. Open WhatsApp → Linked Devices\n2. Link a Device → Link with phone number\n3. Enter this code: ${code}\n\n*🌐 OR USE SITE:*\n${PAIR_SITE}\n\n*© PROFESSOR COOLGUY*`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363161513685998@newsletter',
                                newsletterName: 'COOLGUY MD V10',
                                serverMessageId: -1
                            }
                        }
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        image: { url: PIC },
                        caption: `*🔥 USE PAIR SITE DIRECTLY!*\n\n*🌐 LINK:*\n${PAIR_SITE}\n\n*Number:* ${number}\n\n*Open site → Enter number → Get Code!*\n\n© COOLGUY MD V10`,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363161513685998@newsletter',
                                newsletterName: 'COOLGUY MD V10',
                                serverMessageId: -1
                            }
                        }
                    }, { quoted: message });
                }
            } catch (apiError) {
                console.error('API Error:', apiError.message);
                await sock.sendMessage(chatId, {
                    image: { url: PIC },
                    caption: `*🔥 COOLGUY PAIR SITE 🔥*\n\n*🌐 LINK:*\n${PAIR_SITE}\n\n*Number:* ${number}\n\n*Error getting code directly, please open site manually!*\n\n*Steps:*\n1. Open link\n2. Enter ${number}\n3. Generate Code\n\n*© COOLGUY MD V10*`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363161513685998@newsletter',
                            newsletterName: 'COOLGUY MD V10',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }
        }
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, {
            text: `*🌐 PAIR SITE:*\n${PAIR_SITE}\n\nOpen to get code!`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'COOLGUY MD V10',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = pairCommand;
