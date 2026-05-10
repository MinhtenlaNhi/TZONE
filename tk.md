Tôi sẽ tìm hiểu thông tin thật về TZONE Toeic trước khi tạo seed data.

Searched web: "TZONE Toeic trung tâm tiếng anh khóa học giá"
Searched web: "TZONE Toeic center courses pricing schedule"
Searched web: ""TZONE" toeic facebook fanpage"
Searched web: "khóa học TOEIC online Việt Nam 2024 2025 giá khóa học lịch học giảng viên"
Searched web: "TZONE TOEIC "Phạm Đình Quang" trung tâm tiếng anh"
Listed directory data
Listed directory seed
Viewed studentCourses.js:1-160
Viewed sample-courses.json:1-15

Tôi thấy hệ thống đã có sẵn dữ liệu khóa học trong `studentCourses.js` với thông tin thực (giảng viên, giá, lịch học đã phù hợp mô hình TZONE Toeic). Tôi sẽ xem cấu trúc hiện tại trước rồi tạo seed script đầy đủ dựa trên dữ liệu có sẵn:

Viewed Course.js:1-36
Viewed User.js:1-71
Viewed paymentMethods.js:1-52

Tôi đã thấy dữ liệu thực của hệ thống — admin email là `pdquang050203@gmail.com` (Phạm Đình Quang), các khóa học đã có tên giảng viên, giá, lịch học thực tế. Tôi sẽ tạo seed script dựa trên chính xác dữ liệu đã có trong hệ thống, mở rộng thêm users (admin, giảng viên, học viên mẫu) để test đầy đủ.

Viewed .env:1-4

Tạo seed script:

Created seed.js

Chạy seed script:

Ran command: `node server/scripts/seed.js --reset`

Seed thành công! Thêm script shortcut vào package.json:

Viewed package.json:1-24
Edited package.json

## ✅ Seed hoàn tất!

### Dữ liệu đã thêm vào database:

**👥 9 Users:**

| Email | Tên | Vai trò | Mã GV |
|-------|-----|---------|-------|
| `pdquang050203@gmail.com` | Phạm Đình Quang | **Admin** | — |
| `hatrang.tzone@gmail.com` | Hà Trang | Teacher | CT3101 |
| `minhtuan.tzone@gmail.com` | Minh Tuấn | Teacher | CT3102 |
| `lananh.tzone@gmail.com` | Lan Anh | Teacher | CT3103 |
| `ducanh.tzone@gmail.com` | Đức Anh | Teacher | CT3104 |
| `phuonganh.tzone@gmail.com` | Phương Anh | Teacher | CT3105 |
| `nguyenvana.student@gmail.com` | Nguyễn Văn An | Student | — |
| `tranthib.student@gmail.com` | Trần Thị Bình | Student | — |
| `levanc.student@gmail.com` | Lê Văn Cường | Student | — |

**📚 10 Khóa học:**

| Mã | Tên | Lịch học | Giá | GV |
|----|-----|----------|-----|-----|
| toeic-a-st15 | TOEIC A ST15 | Tối 2-4-6 \| 18h-19h30 | 3.200.000đ | Hà Trang |
| tap-su-ts08 | TẬP SỰ TS08 | Tối 3-5-7 \| 19h-20h30 | 2.800.000đ | Hà Trang |
| toeic-a-st16 | TOEIC A ST16 | Sáng 2-4-6 \| 8h-9h30 | 3.200.000đ | Minh Tuấn |
| toeic-b-tb02 | TOEIC B TB02 | Chiều 2-4-6 \| 14h-15h30 | 3.500.000đ | Lan Anh |
| tap-su-ts09 | TẬP SỰ TS09 | Tối 2-4-6 \| 18h-19h30 | 2.800.000đ | Hà Trang |
| toeic-sw-sw01 | TOEIC SW SW01 | Cuối tuần \| 9h-11h | 2.400.000đ | Đức Anh |
| tap-su-st35 | Tập sự ST35 | Tối 3-5-7 \| 20h-21h30 | 2.900.000đ | Phương Anh |
| toeic-a-st17 | TOEIC A ST17 | Tối 3-5-7 \| 18h-19h30 | 3.200.000đ | Minh Tuấn |
| toeic-b-tb03 | TOEIC B TB03 | Sáng 3-5-7 \| 9h-10h30 | 3.500.000đ | Lan Anh |
| tap-su-ts10 | TẬP SỰ TS10 | Cuối tuần \| 14h-15h30 | 2.800.000đ | Phương Anh |

### 🔐 Mật khẩu chung: `Tzone@2025`

### Chạy lại khi cần:
```bash
npm run seed -w server           # Thêm mà không xóa
npm run seed:reset -w server     # Xóa sạch rồi seed lại
```

> Dữ liệu lấy từ chính xác `studentCourses.js` và `paymentMethods.js` đã có sẵn trong hệ thống — tên giảng viên, giá, lịch học, admin email đều khớp với code hiện tại.