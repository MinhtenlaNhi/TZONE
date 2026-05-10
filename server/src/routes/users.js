const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

/* ───── Multer config cho avatar ───── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, `../media/profile/${req.user._id}`);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)."));
    }
  }
});

/* ───── GET /api/users/me ───── */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    return res.json({ success: true, user: req.user.toSafeObject() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───── PUT /api/users/me ───── */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body || {};
    const user = req.user;

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: "Tên không được để trống." });
      }
      user.name = trimmed;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    await user.save();
    return res.json({ success: true, user: user.toSafeObject() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

/* ───── POST /api/users/me/avatar ───── */
router.post("/me/avatar", authMiddleware, (req, res) => {
  upload.single("avatar")(req, res, async (err) => {
    if (err) {
      const msg = err instanceof multer.MulterError
        ? (err.code === "LIMIT_FILE_SIZE" ? "File quá lớn (tối đa 5MB)." : err.message)
        : err.message;
      return res.status(400).json({ success: false, message: msg });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh." });
    }
    try {
      const user = req.user;
      // Xóa avatar cũ nếu có (chỉ xóa file local)
      if (user.avatar && (user.avatar.startsWith("/uploads/") || user.avatar.startsWith("/media/"))) {
        const oldPath = path.join(__dirname, "..", user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.avatar = `/media/profile/${req.user._id}/${req.file.filename}`;
      await user.save();
      return res.json({ success: true, avatar: user.avatar, user: user.toSafeObject() });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
  });
});

module.exports = router;
