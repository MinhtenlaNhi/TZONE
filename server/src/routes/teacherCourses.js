const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Lesson"); // Note: there is no Section model, sections are grouped by sectionIndex in Lesson
const Lesson = require("../models/Lesson");
const Assignment = require("../models/Assignment");
const { authMiddleware } = require("../middlewares/auth");
const { buildCurriculum } = require("../utils/lessonHelpers");

const router = express.Router();

/** Chỉ enrollment của tài khoản học viên (loại giáo viên / admin). */
async function findStudentEnrollments(filter) {
  const enrollments = await Enrollment.find(filter)
    .populate({
      path: "user",
      select: "name email avatar phone role",
      match: { role: "student" }
    })
    .sort({ enrolledAt: -1 })
    .lean();

  return enrollments.filter((e) => e.user);
}

// Middleware: Check if user is teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Quyền truy cập bị từ chối." });
  }
  next();
};

// 1. GET /api/teacher/courses - Lấy danh mục khóa học của giáo viên
router.get("/", authMiddleware, isTeacher, async (req, res) => {
  try {
    const filter = { instructorRef: req.user._id };
    const courses = await Course.find(filter)
      .populate("categoryRef", "name")
      .sort({ createdAt: -1 })
      .lean();

    const courseIds = courses.map(c => c._id);
    
    const studentEnrollments = await findStudentEnrollments({ course: { $in: courseIds } });
    const totalStudents = studentEnrollments.length;
    
    let totalProgress = 0;
    studentEnrollments.forEach(e => {
      totalProgress += (e.progress || 0);
    });
    const avgCompletionRate = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    const totalLessons = await Lesson.countDocuments({
      courseRef: { $in: courseIds },
      isSectionPlaceholder: { $ne: true }
    });

    res.json({ 
      success: true, 
      courses, 
      stats: {
        totalStudents,
        totalLessons,
        avgCompletionRate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 2. GET /api/teacher/courses/:id/students - Danh sách học viên đang học
router.get("/:id/students", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, instructorRef: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: "Khóa học không thuộc quyền quản lý của bạn." });
    }

    const students = await findStudentEnrollments({ course: id });

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 2.5 GET /api/teacher/courses/:id/lessons - Lấy lộ trình bài học (Cho giáo viên)
router.get("/:id/lessons", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, instructorRef: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: "Khóa học không thuộc quyền quản lý của bạn." });
    }

    const lessons = await Lesson.find({ courseRef: id }).sort({ sectionIndex: 1, order: 1 }).lean();
    const assignments = await Assignment.find({ courseRef: id }).lean();
    const curriculum = buildCurriculum(lessons, assignments);

    res.json({ success: true, curriculum });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 3. POST /api/teacher/courses/:id/sections - Thêm chương mới
router.post("/:id/sections", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionTitle } = req.body;

    const course = await Course.findOne({ _id: id, instructorRef: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    }

    // Lấy sectionIndex lớn nhất hiện tại
    const lastLesson = await Lesson.findOne({ courseRef: id }).sort({ sectionIndex: -1 });
    const nextSectionIndex = lastLesson ? lastLesson.sectionIndex + 1 : 1;

    // Tạo bản ghi placeholder để lưu metadata chương (không hiển thị như bài học)
    const newSectionPlaceholder = new Lesson({
      courseRef: id,
      sectionIndex: nextSectionIndex,
      sectionTitle,
      title: sectionTitle,
      order: 0,
      isSectionPlaceholder: true
    });

    await newSectionPlaceholder.save();

    res.json({ success: true, message: "Đã thêm chương mới", sectionIndex: nextSectionIndex });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 3.5 PUT /api/teacher/courses/:id/sections/:sectionIndex - Cập nhật tên chương
router.put("/:id/sections/:sectionIndex", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { id, sectionIndex } = req.params;
    const { sectionTitle } = req.body;

    if (!sectionTitle?.trim()) {
      return res.status(400).json({ success: false, message: "Tên chương không được để trống." });
    }

    const course = await Course.findOne({ _id: id, instructorRef: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    }

    const idx = Number(sectionIndex);
    const sectionExists = await Lesson.findOne({ courseRef: id, sectionIndex: idx });
    if (!sectionExists) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chương này." });
    }

    await Lesson.updateMany(
      { courseRef: id, sectionIndex: idx },
      { $set: { sectionTitle: sectionTitle.trim() } }
    );

    res.json({ success: true, message: "Đã cập nhật chương." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 4. POST /api/teacher/courses/:id/lessons - Thêm bài học mới vào một chương
router.post("/:id/lessons", authMiddleware, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionIndex, title, isFreePreview } = req.body;

    const course = await Course.findOne({ _id: id, instructorRef: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    }

    // Tìm sectionTitle của sectionIndex này
    const existingLesson = await Lesson.findOne({ courseRef: id, sectionIndex });
    if (!existingLesson) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chương này." });
    }

    // Lấy order lớn nhất trong section này (bỏ qua placeholder chương)
    const lastLessonInSec = await Lesson.findOne({
      courseRef: id,
      sectionIndex,
      isSectionPlaceholder: { $ne: true }
    }).sort({ order: -1 });
    const nextOrder = lastLessonInSec ? lastLessonInSec.order + 1 : 1;

    const newLesson = new Lesson({
      courseRef: id,
      sectionIndex,
      sectionTitle: existingLesson.sectionTitle,
      title,
      order: nextOrder,
      isFreePreview: !!isFreePreview
    });

    await newLesson.save();

    res.json({ success: true, message: "Đã thêm bài học mới", lesson: newLesson });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
