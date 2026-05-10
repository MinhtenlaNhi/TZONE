/**http://localhost:5000/api/payment-methods lấy thông tin tài khoản và mã QR thanh toán */
module.exports = [
  {
    id: "mb",
    accountNumber: "3688605203333",
    accountName: "PHAM DINH QUANG",
    branch: "MB Bank — VietQR / Napas 247",
    note: "Nội dung CK: SĐT đăng ký + Họ tên",
    qrImage: "/images/payments/mb-qr.png"
  },
  {
    id: "vcb",
    accountNumber: "1012345678",
    accountName: "CONG TY CO PHAN TZONE",
    branch: "Chi nhánh TP.HCM",
    note: "Nội dung CK: SĐT đăng ký + Họ tên",
    qrImage: null
  },
  {
    id: "tcb",
    accountNumber: "1903 7467 4060 10",
    accountName: "PHAM DINH QUANG",
    branch: "Techcombank — VietQR / Napas 247",
    note: "Nội dung CK: SĐT đăng ký + Họ tên",
    qrImage: "/images/payments/tcb-qr.png"
  },
  {
    id: "agri",
    accountNumber: "1500 2015 67890",
    accountName: "CONG TY CO PHAN TZONE",
    branch: "Chi nhánh Cầu Giấy",
    note: "Nội dung CK: SĐT đăng ký + Họ tên",
    qrImage: null
  },
  {
    id: "vib",
    accountNumber: "012704060008914",
    accountName: "CONG TY CO PHAN TZONE",
    branch: "VIB Online",
    note: "Nội dung CK: SĐT đăng ký + Họ tên",
    qrImage: null
  },
  {
    id: "momo",
    accountNumber: "0964767902",
    accountName: "PHAM DINH QUANG",
    branch: "Ví MoMo — VietQR / Napas 247",
    note: "Ghi chú: Họ tên + Khóa học",
    qrImage: "/images/payments/momo-qr.png"
  }
];
