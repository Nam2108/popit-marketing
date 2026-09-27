# POPIT Marketing Landing Page

Landing page responsive cho dịch vụ Digital Marketing:
- Facebook Ads
- TikTok Ads
- Google Ads
- Website / Landing Page

## Chạy thử
```bash
npm install
npm start
```

Tạo một Google Sheet mới, mở **Extensions > Apps Script**, dán code trong `apps-script/Code.gs`, rồi triển khai dưới dạng **Web app** với quyền **Anyone**. Copy URL `/exec`, tạo file `.env` từ `.env.example` và dán URL vào `GOOGLE_SHEETS_WEBHOOK_URL`.

Backend sẽ chuyển tiếp lead tới Google Sheets. Không mở trực tiếp file `index.html`, vì khi đó đường dẫn `/api/leads` không tồn tại.

Ví dụ `.env`:
```env
PORT=3000
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Kiểm tra kết nối bằng cách mở `http://localhost:3000/api/health`. Kết quả đúng là `{ "ok": true, "storage": "google-sheets" }`.

## Cấu trúc
- index.html
- style.css
- script.js

## API
- `POST /api/leads`: nhận `name`, `phone`, `email`, `service`, `message`.
- `GET /api/health`: kiểm tra server và cấu hình Google Sheets.

Các thông tin như tên thương hiệu, hotline, email, giá và case study trong bản này là dữ liệu mẫu.
