const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  courseRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  sectionIndex: {
    type: Number,
    required: true,
    default: 1
  },
  sectionTitle: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  date: {
    type: Date, // Ngày giờ dự kiến học
  },
  meetUrl: {
    type: String, // Có thể trống ban đầu, giáo viên điền sau
  },
  materials: [{
    title: String,
    url: String
  }],
  isFreePreview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
