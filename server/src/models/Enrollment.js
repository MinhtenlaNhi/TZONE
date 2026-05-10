const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order" // Có thể null nếu đăng ký trial
  },
  isTrial: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number, // % tiến độ hoàn thành (từ 0 đến 100)
    default: 0
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Đảm bảo 1 user không thể đăng ký cùng 1 khóa nhiều lần (dù trial hay mua thật)
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);
