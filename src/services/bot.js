import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { orderService } from './orderServiceBot.js';
import { sendRevenueReport } from './discordMain.js';
import env from '../config/envBot.js';

const DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, () => {
    console.log('Bot đã sẵn sàng!');
});

client.on(Events.MessageCreate, async (message) => {
    // Bỏ qua tin nhắn từ bot
    if (message.author.bot) return;

    // Xử lý các command
    if (message.content.startsWith('!')) {
        const command = message.content.slice(1).toLowerCase();

        try {
            switch (command) {
                case 'today':
                    await sendRevenueReport('day');
                    break;
                case 'week':
                    await sendRevenueReport('week');
                    break;
                case 'month':
                    await sendRevenueReport('month');
                    break;
                default:
                    message.reply('Command không hợp lệ. Các command có sẵn: !today, !week, !month');
            }
        } catch (error) {
            console.error('Error handling command:', error);
            message.reply('Có lỗi xảy ra khi xử lý command.');
        }
    }
});

// Kết nối bot với Discord
client.login(DISCORD_BOT_TOKEN); 