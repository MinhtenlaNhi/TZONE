const express = require("express");
const User = require("../models/User");
const { isDbReady } = require("../db");
const { verifyAdminFromRequestBody, normalizeEmail } = require("../utils/adminAuth");
const { ensureTeacherHasCode } = require("../utils/teacherCode");

const router = express.Router();

function dbUnavailable(res) {
  return res.status(503).json({ success: false, message: "Cơ sở dữ liệu chưa sẵn sàng." });
}

/** Danh sách giáo viên chờ duyệt */
router.post("/pending-teachers", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  const v = await verifyAdminFromRequestBody(req.body);
  if (!v.ok) return res.status(v.status).json({ success: false, message: v.message });
  try {
    /** pending rõ ràng, hoặc bản ghi cũ chưa có trường (coi như chưa duyệt). */
    const rows = await User.find({
      role: "teacher",
      $or: [
        { teacherApprovalStatus: "pending" },
        { teacherApprovalStatus: null },
        { teacherApprovalStatus: { $exists: false } }
      ]
    })
      .sort({ createdAt: 1 })
      .select("email name teacherApprovalStatus createdAt")
      .lean();
    return res.json({ success: true, teachers: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/** Tất cả giáo viên (để admin xem trạng thái) */
router.post("/teachers", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  const v = await verifyAdminFromRequestBody(req.body);
  if (!v.ok) return res.status(v.status).json({ success: false, message: v.message });
  try {
    const rows = await User.find({ role: "teacher" })
      .sort({ updatedAt: -1 })
      .select("email name teacherApprovalStatus teacherCode createdAt updatedAt")
      .lean();
    return res.json({ success: true, teachers: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

router.post("/approve-teacher", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  const v = await verifyAdminFromRequestBody(req.body);
  if (!v.ok) return res.status(v.status).json({ success: false, message: v.message });
  try {
    const teacherEmail = normalizeEmail(req.body?.teacherEmail);
    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: "Thiếu email giáo viên." });
    }
    const user = await User.findOne({ email: teacherEmail, role: "teacher" });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản giáo viên." });
    }
    user.teacherApprovalStatus = "approved";
    await ensureTeacherHasCode(user);
    await user.save();
    return res.json({
      success: true,
      message: "Đã phê duyệt tài khoản giáo viên.",
      teacherCode: user.teacherCode || null
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

router.post("/reject-teacher", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  const v = await verifyAdminFromRequestBody(req.body);
  if (!v.ok) return res.status(v.status).json({ success: false, message: v.message });
  try {
    const teacherEmail = normalizeEmail(req.body?.teacherEmail);
    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: "Thiếu email giáo viên." });
    }
    const user = await User.findOne({ email: teacherEmail, role: "teacher" });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản giáo viên." });
    }
    user.teacherApprovalStatus = "rejected";
    await user.save();
    return res.json({ success: true, message: "Đã từ chối tài khoản giáo viên." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
