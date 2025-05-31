import { orderService } from './orderServiceBot.js';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { env } from '../config/env.js';

const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;

export const sendDiscordNotification = async (orderData) => {
    try {
        const message = {
            embeds: [{
                title: '🆕 ĐƠN HÀNG MỚI',
                color: 0x3498db,
                description: `**Thời gian:** ${format(new Date(), 'HH:mm:ss dd/MM/yyyy')}`,
                fields: [
                    {
                        name: '👤 KHÁCH HÀNG',
                        value: `**${orderData.customer_info.name}**\n📱 ${orderData.customer_info.phone}\n📍 ${orderData.customer_info.address}`,
                        inline: false
                    },
                    {
                        name: '📋 CHI TIẾT ĐƠN HÀNG',
                        value: orderData.items.map((item, index) =>
                            `**${index + 1}. ${item.name}**\n` +
                            `▫️ Size: ${item.size}\n` +
                            `▫️ Số lượng: x${item.quantity || 1}\n` +
                            `▫️ Giá: ${item.price.toLocaleString()}đ\n` +
                            `▫️ Đường: ${item.sugar || '100%'}\n` +
                            `▫️ Đá: ${item.ice || '100%'}\n` +
                            `${item.toppings?.length ? `▫️ Topping: ${item.toppings.map(t => `${t.name} (+${t.price.toLocaleString()}đ)`).join(', ')}\n` : ''}` +
                            `${item.note ? `▫️ Ghi chú: ${item.note}\n` : ''}`
                        ).join('\n\n'),
                        inline: false
                    },
                    {
                        name: '💰 TỔNG TIỀN',
                        value: `**${orderData.total.toLocaleString()}đ**`,
                        inline: false
                    }
                ],
                footer: {
                    text: 'BuaNay POS System'
                },
                timestamp: new Date().toISOString()
            }]
        };

        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
    } catch (error) {
        console.error('Error sending Discord notification:', error);
        throw error;
    }
};

export const sendRevenueReport = async (period) => {
    try {
        const revenue = await orderService.getRevenueReport(period);
        const dateRange = getDateRange(period);

        const message = {
            embeds: [{
                title: '📊 Báo cáo doanh thu',
                color: 0x2ecc71,
                fields: [
                    {
                        name: 'Thời gian',
                        value: `Từ ${dateRange.start} đến ${dateRange.end}`,
                        inline: false
                    },
                    {
                        name: 'Tổng doanh thu',
                        value: `${revenue.total_revenue.toLocaleString()}đ`,
                        inline: true
                    },
                    {
                        name: 'Số đơn hàng',
                        value: revenue.total_orders.toString(),
                        inline: true
                    },
                    {
                        name: 'Đơn hàng trung bình',
                        value: `${revenue.average_order_value.toLocaleString()}đ`,
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        // Thêm top sản phẩm bán chạy nếu có
        if (revenue.top_products && revenue.top_products.length > 0) {
            message.embeds[0].fields.push({
                name: 'Top sản phẩm bán chạy',
                value: revenue.top_products.map((product, index) =>
                    `${index + 1}. ${product.name}\n` +
                    `   • Đã bán: ${product.quantity}\n` +
                    `   • Doanh thu: ${product.revenue.toLocaleString()}đ`
                ).join('\n'),
                inline: false
            });
        }

        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
    } catch (error) {
        console.error('Error sending revenue report:', error);
        throw error;
    }
};

const getDateRange = (period) => {
    const now = new Date();
    switch (period) {
        case 'day':
            return {
                start: format(startOfDay(now), 'dd/MM/yyyy'),
                end: format(endOfDay(now), 'dd/MM/yyyy')
            };
        case 'week':
            return {
                start: format(startOfWeek(now), 'dd/MM/yyyy'),
                end: format(endOfWeek(now), 'dd/MM/yyyy')
            };
        case 'month':
            return {
                start: format(startOfMonth(now), 'dd/MM/yyyy'),
                end: format(endOfMonth(now), 'dd/MM/yyyy')
            };
        default:
            return {
                start: format(startOfDay(now), 'dd/MM/yyyy'),
                end: format(endOfDay(now), 'dd/MM/yyyy')
            };
    }
}; 