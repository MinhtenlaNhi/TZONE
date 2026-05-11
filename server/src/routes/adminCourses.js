const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Course = require("../models/Course");
const Category = require("../models/Category");
const { isDbReady } = require("../db");
const { authMiddleware } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/role");
const { verifyAdminFromRequestBody } = require("../utils/adminAuth");

const router = express.Router();

// Cấu hình Multer cho việc upload thumbnail khóa học
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads/courses");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `course-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"), false);
    }
  }
});

const BADGE_BY_CAT = {
  "tap-su": "KHÓA TẬP SỰ",
  "toeic-a": "KHÓA TOEIC A",
  "toeic-b": "KHÓA TOEIC B",
  "toeic-sw": "KHÓA TOEIC SW"
};

function dbUnavailable(res) {
  return res.status(503).json({ success: false, message: "Cơ sở dữ liệu chưa sẵn sàng." });
}

function parseTimeToMin(s) {
  if (s == null) return null;
  const str = String(s).trim();
  const m = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null;
  return h * 60 + min;
}

function normalizeSessionsFromPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload.sessions) && payload.sessions.length > 0) {
    const out = [];
    for (const s of payload.sessions) {
      const col = Number(s.col);
      const startMin = Number(s.startMin);
      const endMin = Number(s.endMin);
      if (col >= 0 && col <= 6 && Number.isFinite(startMin) && Number.isFinite(endMin) && endMin > startMin) {
        out.push({ col, startMin, endMin });
      }
    }
    return out.length ? out : null;
  }
  const colsRaw = payload.sessionCols || payload.weekdayCols;
  if (!Array.isArray(colsRaw) || colsRaw.length === 0) return null;
  const startMin = parseTimeToMin(payload.startTime);
  const endMin = parseTimeToMin(payload.endTime);
  if (startMin == null || endMin == null || endMin <= startMin) return null;
  const cols = [...new Set(colsRaw.map((c) => Number(c)).filter((c) => c >= 0 && c <= 6))];
  if (!cols.length) return null;
  return cols.map((col) => ({ col, startMin, endMin }));
}

function generateSlug(text) {
  if (!text) return `k_${Date.now()}`;
  return text.toString().toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// --- LEGACY ROUTES (giữ tương thích cũ) ---
router.post("/courses-list", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  const v = await verifyAdminFromRequestBody(req.body);
  if (!v.ok) return res.status(v.status).json({ success: false, message: v.message });
  try {
    const rows = await Course.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, courses: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// --- NEW JWT PROTECTED ROUTES ---
router.use("/v2/courses", authMiddleware, isAdmin);

/** GET /api/admin/v2/courses - Lấy tất cả khóa học */
router.get("/v2/courses", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const courses = await Course.find({}).populate("categoryRef", "name slug").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, courses });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/** POST /api/admin/v2/courses - Tạo khóa học mới */
router.post("/v2/courses", upload.single("thumbnail"), async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    // Parse form data
    const raw = req.body;
    let sessions = null;
    if (raw.sessions) {
      try {
        sessions = JSON.parse(raw.sessions);
      } catch (err) {}
    }

    const docData = {
      id: raw.id || generateSlug(raw.title || "Khóa học mới"),
      categoryId: raw.categoryId || "tap-su", // fallback for backward compat
      categoryRef: raw.categoryRef || null,
      title: raw.title || "Khóa học mới",
      description: raw.description || "",
      schedule: raw.schedule || "",
      totalSessions: Number(raw.totalSessions) || 0,
      sessionDuration: Number(raw.sessionDuration) || 90,
      startDate: raw.startDate || "",
      enrollmentOpenDate: raw.enrollmentOpenDate ? new Date(raw.enrollmentOpenDate) : null,
      enrollmentCloseDate: raw.enrollmentCloseDate ? new Date(raw.enrollmentCloseDate) : null,
      isPublished: raw.isPublished === "true" || raw.isPublished === true,
      trialLessonCount: Number(raw.trialLessonCount) || 2,
      enrolled: raw.enrolled || "0",
      capacity: raw.capacity || "30",
      rating: Number(raw.rating) || 5,
      price: raw.price || "",
      instructor: raw.instructor || ""
    };

    if (sessions) {
      docData.sessions = sessions;
    }

    if (req.file) {
      docData.thumbnail = `/uploads/courses/${req.file.filename}`;
    }

    const doc = await Course.create(docData);
    return res.status(201).json({ success: true, message: "Đã tạo khóa học.", course: doc });
  } catch (e) {
    console.error(e);
    if (e.code === 11000) {
      return res.status(409).json({ success: false, message: "Mã khóa học trùng trong CSDL." });
    }
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/** PUT /api/admin/v2/courses/:id - Cập nhật khóa học */
router.put("/v2/courses/:id", upload.single("thumbnail"), async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const raw = req.body;
    let sessions = undefined;
    if (raw.sessions) {
      try {
        sessions = JSON.parse(raw.sessions);
      } catch (err) {}
    }

    const updateData = {
      title: raw.title,
      description: raw.description,
      schedule: raw.schedule,
      totalSessions: raw.totalSessions ? Number(raw.totalSessions) : undefined,
      sessionDuration: raw.sessionDuration ? Number(raw.sessionDuration) : undefined,
      startDate: raw.startDate,
      enrollmentOpenDate: raw.enrollmentOpenDate ? new Date(raw.enrollmentOpenDate) : null,
      enrollmentCloseDate: raw.enrollmentCloseDate ? new Date(raw.enrollmentCloseDate) : null,
      isPublished: raw.isPublished === "true" || raw.isPublished === true,
      trialLessonCount: raw.trialLessonCount ? Number(raw.trialLessonCount) : undefined,
      enrolled: raw.enrolled,
      capacity: raw.capacity,
      rating: raw.rating ? Number(raw.rating) : undefined,
      price: raw.price,
      instructor: raw.instructor
    };

    if (raw.categoryId) updateData.categoryId = raw.categoryId;
    if (raw.categoryRef) updateData.categoryRef = raw.categoryRef;
    if (sessions) updateData.sessions = sessions;
    
    if (req.file) {
      updateData.thumbnail = `/uploads/courses/${req.file.filename}`;
    }

    // Xóa các field undefined để mongoose không ghi đè thành rỗng
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const doc = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("categoryRef", "name slug");
    if (!doc) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    }

    return res.json({ success: true, message: "Cập nhật thành công", course: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/** DELETE /api/admin/v2/courses/:id - Xóa khóa học */
router.delete("/v2/courses/:id", async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);
  try {
    const doc = await Course.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
    }
    return res.json({ success: true, message: "Xóa khóa học thành công" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
