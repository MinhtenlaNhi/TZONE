const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Cấu hình Multer để upload ảnh chuyển khoản
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/receipts");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file ảnh!"));
    }
  }
});

// Helper: Phân tích giá tiền từ chuỗi (Vd: "3.200.000đ" -> 3200000)
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const numStr = priceStr.toString().replace(/[^\d]/g, "");
  return parseInt(numStr, 10) || 0;
}

// 1. Lịch sử đơn hàng của User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "items.courseRef",
        select: "id title thumbnail categoryRef",
        populate: { path: "categoryRef", select: "name" }
      })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi khi tải lịch sử đơn hàng." });
  }
});

// 2. Lấy chi tiết một đơn hàng
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate({
        path: "items.courseRef",
        select: "id title thumbnail schedule instructor"
      })
      .lean();
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    
    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi khi lấy chi tiết đơn hàng." });
  }
});

// 3. Tạo đơn hàng từ giỏ hàng (Chấp nhận multipart/form-data)
router.post("/", authMiddleware, upload.single("transferReceipt"), async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (!["transfer", "vnpay", "momo", "zalopay"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Phương thức thanh toán không hợp lệ." });
    }

    if (paymentMethod === "transfer" && !req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng tải lên ảnh minh chứng chuyển khoản." });
    }

    // 1. Lấy giỏ hàng
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.courseRef");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống." });
    }

    // 2. Kiểm tra lại điều kiện khóa học
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const course = item.courseRef;
      if (!course) continue;

      // Ktra xem user đã mua chưa
      const enrolled = await Enrollment.findOne({ user: req.user._id, course: course._id, isTrial: false });
      if (enrolled) {
        return res.status(400).json({ success: false, message: `Bạn đã sở hữu khóa học ${course.title}` });
      }

      const numPrice = parsePrice(course.price);
      totalAmount += numPrice;

      orderItems.push({
        courseRef: course._id,
        priceAtPurchase: numPrice,
        priceString: course.price
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "Không có khóa học hợp lệ trong giỏ." });
    }

    // 3. Tạo đơn hàng
    let receiptPath = null;
    if (req.file) {
      receiptPath = `/uploads/receipts/${req.file.filename}`;
    }

    const newOrder = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      transferReceipt: receiptPath,
      status: "pending" // Nếu là chuyển khoản hoặc VNPAY thì ban đầu là pending
    });

    // 4. Nếu là mock gateway (vnpay/momo/zalopay) -> Tạm thời tự động chuyển sang "paid" và tạo enrollment
    // Trong thực tế, phải có callback từ gateway để update trạng thái đơn.
    if (["vnpay", "momo", "zalopay"].includes(paymentMethod)) {
      newOrder.status = "paid";
      await newOrder.save();

      // Tạo enrollment cho từng khóa học
      for (const item of orderItems) {
        // Xóa enrollment trial nếu có
        await Enrollment.deleteOne({ user: req.user._id, course: item.courseRef, isTrial: true });
        
        await Enrollment.create({
          user: req.user._id,
          course: item.courseRef,
          order: newOrder._id,
          isTrial: false
        });
      }
    }

    // 5. Xóa giỏ hàng
    cart.items = [];
    await cart.save();

    return res.json({ success: true, message: "Đặt hàng thành công.", orderId: newOrder._id, status: newOrder.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Lỗi máy chủ khi tạo đơn hàng." });
  }
});

module.exports = router;
