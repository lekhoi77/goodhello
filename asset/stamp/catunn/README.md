# Catunn — hồ sơ chờ nội dung

Đã khai báo `catunn` trong `asset/data/users-data.json` và chuẩn bị 6 ảnh placeholder.

## Hoàn thiện trước khi gửi thiệp

- Thay `stamp-catunn-1.png` đến `stamp-catunn-6.png` bằng ảnh tem thật, giữ nguyên tên file.
- Cập nhật `mainTitle`, `stamps[].title` và `stamps[].description` trong hồ sơ `catunn`.
- Thời gian bắt đầu: 16:30 ngày 20/09/2026. Giờ kết thúc tạm đặt 19:30 (giữ thời lượng mẫu 3 giờ), cần xác nhận lại. Footer tự hiển thị 19–20–21/09 và SEPTEMBER/2026 theo ngày sự kiện.
- Cập nhật thông tin `event`: tên hiển thị, mô tả và địa điểm. Địa chỉ 59c Nguyễn Đình Chiểu hiện chỉ là dữ liệu mẫu từ hồ sơ có sẵn, chưa phải thông tin đã xác nhận của Catunn.
- Định dạng thời gian: `YYYYMMDDTHHmmss`. Cập nhật cả `displayTime` để giờ hiển thị trên thiệp khớp với lịch. Có thể thêm `locationDisplay` (xuống dòng bằng `\n`) và `mapUrl` nếu cần.

## Kiểm tra và xuất bản

- Mở website qua HTTP với `/index.html?user=catunn` để xem trước.
- Kiểm tra nhập tên khách, chọn từng tem, thiệp mời, lịch, bản đồ, gửi lời chúc và PDF sau khi thay nội dung thật.
- Code tự nhận `catunn.goodhello.space`; để dùng URL này cần deploy bản cập nhật và bảo đảm subdomain được cấu hình trong Vercel/DNS (hoặc đã có wildcard).
- Wishes, visits và localStorage được phân biệt theo host `catunn` bởi logic hiện có. Không cần tạo collection riêng; quyền truy cập/index Firestore phụ thuộc cấu hình backend đang triển khai.
