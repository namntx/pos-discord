const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const sendTelegramNotification = async (orderData) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram configuration missing');
    return;
  }

  const message = `
🔔 ĐƠN HÀNG MỚI!

👤 Khách hàng: ${orderData.customerInfo.name}
📞 SĐT: ${orderData.customerInfo.phone}
📍 Địa chỉ: ${orderData.customerInfo.address}

🛍️ Đơn hàng:
${orderData.items.map(item => 
  `• ${item.name} x1 - ${item.total.toLocaleString()}đ
  ${item.toppings.length > 0 ? `  Topping: ${item.toppings.map(t => t.name).join(', ')}\n` : ''}  Đường: ${item.sugar} | Đá: ${item.ice}
  ${item.note ? `  Ghi chú: ${item.note}\n` : ''}`
).join('\n')}

💰 Tổng cộng: ${orderData.total.toLocaleString()}đ
⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}
📱 ID đơn hàng: #${orderData.id}
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send telegram message');
    }

    console.log('Telegram notification sent successfully');
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};