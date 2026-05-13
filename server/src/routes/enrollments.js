const express = require("express");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Helper: tìm Course bằng param courseId (hỗ trợ cả ObjectId và string id)
async function findCourse(courseId) {
  return Course.findOne({
    $or: [{ _id: courseId.match(/^[0-9a-fA-F]{24}$/) ? courseId : null }, { id: courseId }]
  });
}

// 1. Lấy danh sách khóa học user đang tham gia
router.get("/", authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: "course",
        select: "id title thumbnail instructor totalSessions sessionDuration sessions",
        populate: { path: "categoryRef", select: "name" }
      })
      .sort({ enrolledAt: -1 })
      .lean();

    return res.json({ success: true, enrollments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách khóa học." });
  }
});

// 2. Lấy lộ trình bài học của một khóa học đã đăng ký
router.get("/:courseId/lessons", authMiddleware, async (req, res) => {
  try {
    const course = await findCourse(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    // Tìm enrollment
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id }).populate("course", "title");
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "Bạn chưa đăng ký khóa học này." });
    }

    // Lấy bài học
    let query = { courseRef: course._id };
    
    // Nếu là học thử, chỉ trả về các bài học isFreePreview
    if (enrollment.isTrial) {
      query.isFreePreview = true;
    }

    const lessons = await Lesson.find(query).sort({ sectionIndex: 1, order: 1 }).lean();

    // Nhóm lại theo Section
    const curriculum = [];
    lessons.forEach(lesson => {
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

    return res.json({ 
      success: true, 
      courseTitle: enrollment.course?.title,
      isTrial: enrollment.isTrial,
      progress: enrollment.progress,
      curriculum 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi khi tải lộ trình học." });
  }
});

// 3. Cập nhật tiến độ học tập
router.put("/:courseId/progress", authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, message: "Tiến độ không hợp lệ." });
    }

    const course = await findCourse(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học đang học." });
    }

    // Chỉ cập nhật nếu progress mới lớn hơn (hoặc do học sinh tự kéo lại)
    enrollment.progress = progress;
    await enrollment.save();

    return res.json({ success: true, progress: enrollment.progress });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi cập nhật tiến độ." });
  }
});

// 4. Đăng ký học thử (Trial Enrollment)
router.post("/course/:courseId/trial", authMiddleware, async (req, res) => {
  try {
    const course = await findCourse(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
    }

    // Kiểm tra xem đã đăng ký khóa này chưa (cả trial lẫn chính thức)
    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Bạn đã đăng ký khóa học này rồi." });
    }

    // Tạo Enrollment trial
    const newEnrollment = new Enrollment({
      user: req.user._id,
      course: course._id,
      isTrial: true,
      progress: 0
    });

    await newEnrollment.save();

    return res.json({ success: true, message: "Đăng ký học thử thành công!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi đăng ký học thử." });
  }
});

module.exports = router;
