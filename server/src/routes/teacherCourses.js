const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Lesson"); // Note: there is no Section model, sections are grouped by sectionIndex in Lesson
const Lesson = require("../models/Lesson");
const Assignment = require("../models/Assignment");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

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
    
    const enrollments = await Enrollment.find({ course: { $in: courseIds } }).lean();
    const totalStudents = enrollments.length;
    
    let totalProgress = 0;
    enrollments.forEach(e => {
      totalProgress += (e.progress || 0);
    });
    const avgCompletionRate = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    const totalLessons = await Lesson.countDocuments({ courseRef: { $in: courseIds } });

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

    const enrollments = await Enrollment.find({ course: id })
      .populate("user", "name email avatar phone")
      .sort({ enrolledAt: -1 })
      .lean();

    res.json({ success: true, students: enrollments });
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

    const curriculum = [];
    lessons.forEach(lesson => {
      lesson.assignments = assignments.filter(a => a.lessonRef.toString() === lesson._id.toString());

      let section = curriculum.find(sec => sec.sectionIndex === lesson.sectionIndex);
      if (!section) {
        section = {
          sectionIndex: lesson.sectionIndex,
          sectionTitle: lesson.sectionTitle,
          lessons: []
        };
        curriculum.push(section);
      }
      section.lessons.push(lesson);
    });

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

    // Tạo một placeholder lesson để lưu section
    const newSectionPlaceholder = new Lesson({
      courseRef: id,
      sectionIndex: nextSectionIndex,
      sectionTitle,
      title: "Bài học đầu tiên (Vui lòng cập nhật)",
      order: 1
    });

    await newSectionPlaceholder.save();

    res.json({ success: true, message: "Đã thêm chương mới", sectionIndex: nextSectionIndex });
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

    // Lấy order lớn nhất trong section này
    const lastLessonInSec = await Lesson.findOne({ courseRef: id, sectionIndex }).sort({ order: -1 });
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
