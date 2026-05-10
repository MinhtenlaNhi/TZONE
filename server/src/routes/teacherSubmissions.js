const express = require("express");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Quyền truy cập bị từ chối." });
  }
  next();
};

const verifyAssignmentOwnership = async (req, res, next) => {
  const { id } = req.params; // assignmentId (GET) or submissionId (PUT)
  try {
    let assignmentId = id;
    if (req.method === "PUT") {
      const sub = await Submission.findById(id);
      if (!sub) return res.status(404).json({ success: false, message: "Không tìm thấy bài nộp." });
      assignmentId = sub.assignmentRef;
      req.submission = sub;
    }

    const assignment = await Assignment.findById(assignmentId).populate("courseRef");
    if (!assignment) return res.status(404).json({ success: false, message: "Không tìm thấy bài tập." });

    if (assignment.courseRef.instructorRef?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Truy cập bị từ chối." });
    }
    
    req.assignment = assignment;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// 1. GET /api/teacher/assignments/:id/submissions - Lấy danh sách bài nộp của một bài tập
router.get("/:id/submissions", authMiddleware, isTeacher, verifyAssignmentOwnership, async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentRef: req.assignment._id })
      .populate("studentRef", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

// 2. PUT /api/teacher/submissions/:id/grade - Chấm điểm và nhận xét (id ở đây là submissionId)
router.put("/:id/grade", authMiddleware, isTeacher, verifyAssignmentOwnership, async (req, res) => {
  try {
    const { score, teacherComment } = req.body;
    
    if (score < 0 || score > 100) {
      return res.status(400).json({ success: false, message: "Điểm không hợp lệ." });
    }

    req.submission.score = score;
    req.submission.teacherComment = teacherComment;
    req.submission.status = "graded";

    await req.submission.save();

    res.json({ success: true, message: "Chấm điểm thành công.", submission: req.submission });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
