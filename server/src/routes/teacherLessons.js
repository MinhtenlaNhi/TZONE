const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Quyền truy cập bị từ chối." });
  }
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/materials");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "mat-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware xác nhận GV có quyền với Lesson này không
const verifyLessonOwnership = async (req, res, next) => {
  const { id } = req.params; // lessonId
  try {
    const lesson = await Lesson.findById(id).populate("courseRef");
    if (!lesson) return res.status(404).json({ success: false, message: "Không tìm thấy bài học." });
    
    if (lesson.courseRef.instructorRef?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    }
    
    req.lesson = lesson;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// 1. POST /api/teacher/lessons/:id/materials - Upload tài liệu bài giảng
router.post("/:id/materials", authMiddleware, isTeacher, verifyLessonOwnership, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Không tìm thấy file upload." });
    
    const { title } = req.body;
    const fileUrl = `/uploads/materials/${req.file.filename}`;

    req.lesson.materials.push({
      title: title || req.file.originalname,
      url: fileUrl
    });

    await req.lesson.save();
    res.json({ success: true, message: "Upload tài liệu thành công.", materials: req.lesson.materials });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 2. POST /api/teacher/lessons/:id/assignments - Tạo bài tập (Quiz/Essay)
router.post("/:id/assignments", authMiddleware, isTeacher, verifyLessonOwnership, async (req, res) => {
  try {
    const { type, title, description, questions } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc." });
    }

    const assignment = new Assignment({
      courseRef: req.lesson.courseRef._id,
      lessonRef: req.lesson._id,
      type,
      title,
      essayDescription: type === "essay" ? description : undefined,
      questions: type === "quiz" ? questions : []
    });

    await assignment.save();
    res.json({ success: true, message: "Đã tạo bài tập.", assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 3. PUT /api/teacher/lessons/:id/assignments/:assignmentId - Cập nhật bài tập
router.put("/:id/assignments/:assignmentId", authMiddleware, isTeacher, verifyLessonOwnership, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, description, questions } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: "Thiếu tiêu đề bài tập." });
    }

    const assignment = await Assignment.findOne({ _id: assignmentId, lessonRef: req.lesson._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài tập." });
    }

    assignment.title = title;
    if (assignment.type === "essay") {
      assignment.essayDescription = description;
    } else if (assignment.type === "quiz") {
      assignment.questions = questions;
    }

    await assignment.save();
    res.json({ success: true, message: "Đã cập nhật bài tập.", assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
