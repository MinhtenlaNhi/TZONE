const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CourseSessionLink = require("../models/CourseSessionLink");
const { isDbReady } = require("../db");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "")
    .toLowerCase()
    .trim();
}

function adminEmailsSet() {
  const raw = process.env.ADMIN_EMAILS || "pdquang050203@gmail.com";
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((s) => normalizeEmail(s))
      .filter(Boolean)
  );
}

function isTeacherApprovedForTools(user) {
  if (user.role !== "teacher") return false;
  const s = user.teacherApprovalStatus;
  if (s === "pending" || s === "rejected") return false;
  return true;
}

function canManageLinks(user) {
  if (!user) return false;
  if (user.role === "teacher") return isTeacherApprovedForTools(user);
  return adminEmailsSet().has(normalizeEmail(user.email));
}

function dbUnavailable(res) {
  return res.status(503).json({
    success: false,
    message: "Cơ sở dữ liệu chưa sẵn sàng."
  });
}

/** Học viên / công khai: lấy link theo khóa */
router.get("/:courseId", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const courseId = String(req.params.courseId || "").trim();
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Thiếu mã khóa." });
    }
    const rows = await CourseSessionLink.find({ courseId }).lean();
    const links = rows.map((r) => ({
      weekdayCol: r.weekdayCol,
      meetUrl: r.meetUrl || "",
      updatedAt: r.updatedAt
    }));
    return res.json({ success: true, links });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/**
 * Giáo viên / admin: cập nhật link cho (courseId, weekdayCol).
 * Body: { email, password, weekdayCol, meetUrl }
 */
router.put("/:courseId", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const courseId = String(req.params.courseId || "").trim();
    const { email, password, weekdayCol, meetUrl } = req.body || {};
    const em = normalizeEmail(email);
    const col = Number(weekdayCol);
    const url = String(meetUrl || "").trim();

    if (!courseId || !em || !password) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đăng nhập hoặc mã khóa." });
    }
    if (!Number.isInteger(col) || col < 0 || col > 6) {
      return res.status(400).json({ success: false, message: "weekdayCol phải từ 0 (Thứ 2) đến 6 (Chủ nhật)." });
    }
    if (url && !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ success: false, message: "Link phải bắt đầu bằng http:// hoặc https://" });
    }

    const user = await User.findOne({ email: em });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }
    if (!canManageLinks(user)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ giáo viên hoặc quản trị viên được cập nhật link buổi học."
      });
    }

    const doc = await CourseSessionLink.findOneAndUpdate(
      { courseId, weekdayCol: col },
      { $set: { meetUrl: url } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({
      success: true,
      link: { weekdayCol: doc.weekdayCol, meetUrl: doc.meetUrl || "", updatedAt: doc.updatedAt }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
