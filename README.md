# LexiQuest – học tiếng Anh B1–C2

Web tĩnh (HTML/CSS/JS thuần) + một Cloudflare Worker nhỏ gọi Gemini API (gói miễn phí) để tạo câu hỏi.

## Cấu trúc
- `index.html`, `css/style.css`
- `js/core.js` trạng thái, hằng số, SRS · `vocab.js` nhập từ · `views.js` dashboard · `session.js` chọn level/chế độ · `ai.js` prompt + gọi proxy · `quiz.js` giao diện làm bài
- `js/config.js` nơi dán URL Worker
- `worker/` proxy giữ API key

## Bước 1 – Lấy API key Gemini miễn phí
Vào aistudio.google.com/app/apikey, đăng nhập Google, bấm Create API key. Không cần thẻ hay nạp tiền. Không dán key vào code hay chat.

## Bước 2 – Deploy Worker (Cloudflare, miễn phí)
```bash
cd worker
npm i -g wrangler
wrangler login
wrangler secret put GEMINI_API_KEY   # dán key khi được hỏi
wrangler deploy
```
Lệnh cuối in ra URL dạng `https://lexiquest-ai.<tên>.workers.dev`.

## Bước 3 – Cấu hình trang
Mở `js/config.js`, thay `API_URL` bằng URL trên.

## Bước 4 – Đưa lên GitHub
Tạo repo mới (ví dụ `lexiquest`), rồi:
```bash
git init && git add . && git commit -m "LexiQuest"
git branch -M main
git remote add origin https://github.com/<user>/lexiquest.git
git push -u origin main
```
Hoặc kéo thả toàn bộ file vào repo trên web GitHub.
Bật Settings → Pages → Branch `main` / root. Link: `https://<user>.github.io/lexiquest/`.

## Bước 5 – Khóa Worker (quan trọng)
Sửa `ALLOWED_ORIGIN` trong `worker/wrangler.toml` thành `https://<user>.github.io`, chạy lại `wrangler deploy`. Nếu không, ai biết URL Worker cũng dùng được key của bạn. Gói miễn phí có giới hạn số yêu cầu mỗi phút/ngày; nếu gặp lỗi 429 hãy đợi rồi thử lại.

## Lưu ý
Tiến độ lưu trong localStorage của trình duyệt (chưa đồng bộ giữa thiết bị). Chạy thử cục bộ: `python3 -m http.server` rồi mở http://localhost:8000.
