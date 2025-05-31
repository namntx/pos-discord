import { orderService } from '../services/orderServiceBot.js';
import { sendRevenueReport } from '../services/discordMain.js';

export default async function handler(req, res) {
    try {
        // Kiểm tra secret key để đảm bảo an toàn
        if (req.headers['x-vercel-cron'] !== process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Gửi báo cáo doanh thu
        await sendRevenueReport('day');

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Bot execution error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 