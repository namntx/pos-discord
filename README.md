# BuaNay POS System

Hệ thống quản lý đơn hàng đồ uống với tích hợp thông báo Discord.

## Cài đặt

1. Clone repository:
```bash
git clone [repository-url]
cd drink-ordering-app
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env từ .env.example và điền các biến môi trường:
```bash
cp .env.example .env
```

## Phát triển

Chạy ứng dụng ở môi trường development:
```bash
npm run dev
```

Chạy bot Discord (chỉ cho development):
```bash
npm run bot
```

## Triển khai lên Vercel

1. Đăng ký tài khoản tại [Vercel](https://vercel.com)

2. Cài đặt Vercel CLI:
```bash
npm install -g vercel
```

3. Đăng nhập vào Vercel:
```bash
vercel login
```

4. Triển khai:
```bash
vercel
```

Hoặc triển khai trực tiếp từ GitHub:
1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình các biến môi trường trong Vercel Dashboard
4. Deploy

## Biến môi trường

- `VITE_SUPABASE_URL`: URL của Supabase project
- `VITE_SUPABASE_ANON_KEY`: Anonymous key của Supabase
- `VITE_DISCORD_WEBHOOK_URL`: Webhook URL của Discord channel
- `CRON_SECRET`: Secret key để bảo vệ cron job (tạo một chuỗi ngẫu nhiên)

## Cấu hình Bot Discord trên Vercel

Bot Discord được cấu hình để chạy tự động thông qua Vercel Cron Jobs:

1. Bot sẽ chạy mỗi ngày lúc 20:00 (8 PM)
2. Gửi báo cáo doanh thu trong ngày
3. Đảm bảo thêm biến môi trường `CRON_SECRET` trong Vercel Dashboard

Để thay đổi lịch chạy bot, chỉnh sửa trường `schedule` trong `vercel.json`:
```json
"crons": [
  {
    "path": "/api/bot",
    "schedule": "0 20 * * *"  // Chạy lúc 20:00 mỗi ngày
  }
]
```

## Tính năng

- Quản lý menu đồ uống
- Đặt hàng và thanh toán
- Thông báo đơn hàng qua Discord
- Báo cáo doanh thu tự động
