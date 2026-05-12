const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/role");
const User = require("../models/User");
const Order = require("../models/Order");

const router = express.Router();

// Lấy danh sách users
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20, role } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Khóa / Mở khóa user
router.put("/:id/toggle-block", authMiddleware, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });
    
    // Không cho phép block các admin khác (hoặc chính mình) trừ khi có superadmin
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Không thể khóa tài khoản Admin" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ 
      success: true, 
      isBlocked: user.isBlocked, 
      message: user.isBlocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản" 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Thay đổi vai trò user
router.put("/:id/role", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Vai trò không hợp lệ" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    // Không cho phép tự hạ quyền admin của chính mình
    if (user._id.toString() === req.user._id.toString() && role !== "admin") {
      return res.status(403).json({ success: false, message: "Không thể tự hạ quyền của chính mình" });
    }

    user.role = role;
    if (role === "teacher" && !user.teacherApprovalStatus) {
      user.teacherApprovalStatus = "approved"; // tự động duyệt nếu admin gán quyền
    }
    await user.save();

    res.json({ success: true, message: "Cập nhật vai trò thành công", user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// Xem lịch sử đơn hàng của user
router.get("/:id/orders", authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate("courses.course", "title")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
