/**
 * Seed Database — TZONE Toeic
 *
 * Thêm dữ liệu thật vào DB: admin, giảng viên, học viên mẫu, khóa học.
 * Dữ liệu lấy từ thông tin thật có sẵn trong hệ thống (studentCourses.js, paymentMethods.js).
 *
 * Chạy:  node server/scripts/seed.js
 * Reset: node server/scripts/seed.js --reset  (xóa hết rồi seed lại)
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI chưa được cấu hình trong server/.env");
  process.exit(1);
}

const User = require("../src/models/User");
const Course = require("../src/models/Course");
const Category = require("../src/models/Category");
const Lesson = require("../src/models/Lesson");
const Assignment = require("../src/models/Assignment");
const Submission = require("../src/models/Submission");

/* ════════════════════════════════════════════════════════
   DỮ LIỆU SEED — LẤY TỪ HỆ THỐNG CÓ SẴN
   ════════════════════════════════════════════════════════ */

const DEFAULT_PASSWORD = "Tzone@2025";  // Mật khẩu chung cho tài khoản seed

/**
 * Users — Dựa trên thông tin thật:
 * - Admin: Phạm Đình Quang (pdquang050203@gmail.com — đã có trong ADMIN_EMAILS)
 * - Giảng viên: lấy từ danh sách instructor trong COURSES
 * - Học viên mẫu: tạo vài tài khoản demo
 */
const SEED_USERS = [
  // ── ADMIN ──
  {
    email: "pdquang050203@gmail.com",
    name: "Phạm Đình Quang",
    phone: "0964767902",
    role: "admin",
    authProvider: "local"
  },

  // ── GIẢNG VIÊN (từ instructor field trong COURSES) ──
  {
    email: "hatrang.tzone@gmail.com",
    name: "Hà Trang",
    phone: "0901234567",
    role: "teacher",
    teacherApprovalStatus: "approved",
    teacherCode: "CT3101",
    authProvider: "local"
  },
  {
    email: "minhtuan.tzone@gmail.com",
    name: "Minh Tuấn",
    phone: "0912345678",
    role: "teacher",
    teacherApprovalStatus: "approved",
    teacherCode: "CT3102",
    authProvider: "local"
  },
  {
    email: "lananh.tzone@gmail.com",
    name: "Lan Anh",
    phone: "0923456789",
    role: "teacher",
    teacherApprovalStatus: "approved",
    teacherCode: "CT3103",
    authProvider: "local"
  },
  {
    email: "ducanh.tzone@gmail.com",
    name: "Đức Anh",
    phone: "0934567890",
    role: "teacher",
    teacherApprovalStatus: "approved",
    teacherCode: "CT3104",
    authProvider: "local"
  },
  {
    email: "phuonganh.tzone@gmail.com",
    name: "Phương Anh",
    phone: "0945678901",
    role: "teacher",
    teacherApprovalStatus: "approved",
    teacherCode: "CT3105",
    authProvider: "local"
  },

  // ── HỌC VIÊN MẪU ──
  {
    email: "nguyenvana.student@gmail.com",
    name: "Nguyễn Văn An",
    phone: "0356789012",
    role: "student",
    authProvider: "local"
  },
  {
    email: "tranthib.student@gmail.com",
    name: "Trần Thị Bình",
    phone: "0367890123",
    role: "student",
    authProvider: "local"
  },
  {
    email: "levanc.student@gmail.com",
    name: "Lê Văn Cường",
    phone: "0378901234",
    role: "student",
    authProvider: "local"
  }
];

/**
 * Categories
 */
const SEED_CATEGORIES = [
  { name: "Tập sự", slug: "tap-su", description: "Dành cho người mất gốc tiếng Anh", order: 1, isActive: true },
  { name: "TOEIC A", slug: "toeic-a", description: "Mục tiêu 450-600+", order: 2, isActive: true },
  { name: "TOEIC B", slug: "toeic-b", description: "Mục tiêu 650-800+", order: 3, isActive: true },
  { name: "TOEIC Speaking & Writing", slug: "toeic-sw", description: "Luyện kỹ năng Nói & Viết", order: 4, isActive: true },
];

/**
 * Khóa học — Lấy CHÍNH XÁC từ client/src/data/studentCourses.js
 * Đây là dữ liệu thật đã có sẵn trong hệ thống TZONE.
 */
const SEED_COURSES = [
  {
    id: "toeic-a-st15",
    categoryId: "toeic-a",
    badge: "KHÓA TOEIC A",
    title: "TOEIC A ST15",
    schedule: "Tối 2-4-6 | 18h-19h30",
    sessions: [
      { col: 0, startMin: 1080, endMin: 1170 },  // Thứ 2: 18:00-19:30
      { col: 2, startMin: 1080, endMin: 1170 },  // Thứ 4: 18:00-19:30
      { col: 4, startMin: 1080, endMin: 1170 }   // Thứ 6: 18:00-19:30
    ],
    startDate: "5/7",
    enrolled: "10",
    capacity: "23",
    rating: 4.5,
    ratingLabel: "4.5k",
    price: "3.200.000đ",
    instructor: "CT3101"    // Ms. Hà Trang
  },
  {
    id: "tap-su-ts08",
    categoryId: "tap-su",
    badge: "KHÓA TẬP SỰ",
    title: "TẬP SỰ TS08",
    schedule: "Tối 3-5-7 | 19h-20h30",
    sessions: [
      { col: 1, startMin: 1140, endMin: 1230 },  // Thứ 3: 19:00-20:30
      { col: 3, startMin: 1140, endMin: 1230 },  // Thứ 5: 19:00-20:30
      { col: 5, startMin: 1140, endMin: 1230 }   // Thứ 7: 19:00-20:30
    ],
    startDate: "12/7",
    enrolled: "8",
    capacity: "20",
    rating: 4.8,
    ratingLabel: "2.1k",
    price: "2.800.000đ",
    instructor: "CT3101"    // Ms. Hà Trang
  },
  {
    id: "toeic-a-st16",
    categoryId: "toeic-a",
    badge: "KHÓA TOEIC A",
    title: "TOEIC A ST16",
    schedule: "Sáng 2-4-6 | 8h-9h30",
    sessions: [
      { col: 0, startMin: 480, endMin: 570 },    // Thứ 2: 8:00-9:30
      { col: 2, startMin: 480, endMin: 570 },    // Thứ 4: 8:00-9:30
      { col: 4, startMin: 480, endMin: 570 }     // Thứ 6: 8:00-9:30
    ],
    startDate: "20/7",
    enrolled: "15",
    capacity: "25",
    rating: 4.6,
    ratingLabel: "3.2k",
    price: "3.200.000đ",
    instructor: "CT3102"    // Mr. Minh Tuấn
  },
  {
    id: "toeic-b-tb02",
    categoryId: "toeic-b",
    badge: "KHÓA TOEIC B",
    title: "TOEIC B TB02",
    schedule: "Chiều 2-4-6 | 14h-15h30",
    sessions: [
      { col: 0, startMin: 840, endMin: 930 },    // Thứ 2: 14:00-15:30
      { col: 2, startMin: 840, endMin: 930 },    // Thứ 4: 14:00-15:30
      { col: 4, startMin: 840, endMin: 930 }     // Thứ 6: 14:00-15:30
    ],
    startDate: "8/8",
    enrolled: "6",
    capacity: "18",
    rating: 4.4,
    ratingLabel: "1.8k",
    price: "3.500.000đ",
    instructor: "CT3103"    // Ms. Lan Anh
  },
  {
    id: "tap-su-ts09",
    categoryId: "tap-su",
    badge: "KHÓA TẬP SỰ",
    title: "TẬP SỰ TS09",
    schedule: "Tối 2-4-6 | 18h-19h30",
    sessions: [
      { col: 0, startMin: 1080, endMin: 1170 },
      { col: 2, startMin: 1080, endMin: 1170 },
      { col: 4, startMin: 1080, endMin: 1170 }
    ],
    startDate: "15/8",
    enrolled: "12",
    capacity: "22",
    rating: 4.7,
    ratingLabel: "900",
    price: "2.800.000đ",
    instructor: "CT3101"    // Ms. Hà Trang
  },
  {
    id: "toeic-sw-sw01",
    categoryId: "toeic-sw",
    badge: "KHÓA TOEIC SW",
    title: "TOEIC SW SW01",
    schedule: "Cuối tuần | 9h-11h",
    sessions: [
      { col: 5, startMin: 540, endMin: 660 },    // Thứ 7: 9:00-11:00
      { col: 6, startMin: 540, endMin: 660 }     // Chủ nhật: 9:00-11:00
    ],
    startDate: "22/8",
    enrolled: "9",
    capacity: "15",
    rating: 4.9,
    ratingLabel: "650",
    price: "2.400.000đ",
    instructor: "CT3104"    // Mr. Đức Anh
  },
  {
    id: "tap-su-st35",
    categoryId: "tap-su",
    badge: "KHÓA TẬP SỰ",
    title: "Tập sự ST35",
    schedule: "Tối 3-5-7 | 20h-21h30",
    sessions: [
      { col: 1, startMin: 1200, endMin: 1290 },  // Thứ 3: 20:00-21:30
      { col: 3, startMin: 1200, endMin: 1290 },  // Thứ 5: 20:00-21:30
      { col: 5, startMin: 1200, endMin: 1290 }   // Thứ 7: 20:00-21:30
    ],
    startDate: "5/4",
    enrolled: "23",
    capacity: "23",
    rating: 4.8,
    ratingLabel: "4.5k",
    price: "2.900.000đ",
    instructor: "CT3105"    // Ms. Phương Anh
  },
  {
    id: "toeic-a-st17",
    categoryId: "toeic-a",
    badge: "KHÓA TOEIC A",
    title: "TOEIC A ST17",
    schedule: "Tối 3-5-7 | 18h-19h30",
    sessions: [
      { col: 1, startMin: 1080, endMin: 1170 },
      { col: 3, startMin: 1080, endMin: 1170 },
      { col: 5, startMin: 1080, endMin: 1170 }
    ],
    startDate: "1/9",
    enrolled: "5",
    capacity: "25",
    rating: 4.5,
    ratingLabel: "—",
    price: "3.200.000đ",
    instructor: "CT3102"    // Mr. Minh Tuấn
  },
  {
    id: "toeic-b-tb03",
    categoryId: "toeic-b",
    badge: "KHÓA TOEIC B",
    title: "TOEIC B TB03",
    schedule: "Sáng 3-5-7 | 9h-10h30",
    sessions: [
      { col: 1, startMin: 540, endMin: 630 },
      { col: 3, startMin: 540, endMin: 630 },
      { col: 5, startMin: 540, endMin: 630 }
    ],
    startDate: "10/9",
    enrolled: "3",
    capacity: "20",
    rating: 4.6,
    ratingLabel: "—",
    price: "3.500.000đ",
    instructor: "CT3103"    // Ms. Lan Anh
  },
  {
    id: "tap-su-ts10",
    categoryId: "tap-su",
    badge: "KHÓA TẬP SỰ",
    title: "TẬP SỰ TS10",
    schedule: "Cuối tuần | 14h-15h30",
    sessions: [
      { col: 5, startMin: 840, endMin: 930 },
      { col: 6, startMin: 840, endMin: 930 }
    ],
    startDate: "15/9",
    enrolled: "0",
    capacity: "20",
    rating: 4.5,
    ratingLabel: "—",
    price: "2.800.000đ",
    instructor: "CT3105"    // Ms. Phương Anh
  }
];

/* ════════════════════════════════════════════════════════
   SEED LOGIC
   ════════════════════════════════════════════════════════ */

async function run() {
  const isReset = process.argv.includes("--reset");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB.\n");

  if (isReset) {
    console.log("🔄 --reset flag: Xóa toàn bộ dữ liệu cũ...");
    await User.deleteMany({});
    await Course.deleteMany({});
    await Category.deleteMany({});
    await Lesson.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    console.log("   Đã xóa users, courses, categories, lessons và assignments.\n");
  }

  /* ──── SEED CATEGORIES ──── */
  console.log("📁 Seeding Categories...");
  const categoryMap = {}; // Để lấy categoryRef cho Course
  for (const cat of SEED_CATEGORIES) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create(cat);
      console.log(`   ✅ Tạo: ${cat.name}`);
    } else {
      console.log(`   ⏭  Skip (đã tồn tại): ${cat.name}`);
    }
    categoryMap[cat.slug] = existing._id;
  }
  console.log("");

  /* ──── SEED USERS ──── */
  console.log("👥 Seeding Users...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const u of SEED_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`   ⏭  Skip (đã tồn tại): ${u.email} [${u.role}]`);
      continue;
    }
    await User.create({
      ...u,
      passwordHash,
      isBlocked: false
    });
    console.log(`   ✅ Tạo: ${u.name} <${u.email}> [${u.role}]`);
  }

  /* ──── SEED COURSES ──── */
  console.log("\n📚 Seeding Courses...");
  const createdCourses = [];

  for (const c of SEED_COURSES) {
    const existing = await Course.findOne({ id: c.id });
    if (existing) {
      console.log(`   ⏭  Skip (đã tồn tại): ${c.title}`);
      createdCourses.push(existing);
      continue;
    }
    const newCourse = await Course.create({
      ...c,
      categoryRef: categoryMap[c.categoryId],
      isPublished: true,
      description: `<p>Đây là mô tả chi tiết mẫu cho khóa học <strong>${c.title}</strong>.</p><p>Khóa học sẽ giúp bạn đạt điểm cao trong kỳ thi TOEIC.</p>`,
      totalSessions: c.sessions.length * 4, // giả sử khóa kéo dài 4 tuần
      sessionDuration: 90
    });
    createdCourses.push(newCourse);
    console.log(`   ✅ Tạo: ${c.title} — ${c.schedule} — ${c.price}`);
  }

  /* ──── SEED LESSONS & ASSIGNMENTS ──── */
  console.log("\n🎬 Seeding Lessons & Assignments...");
  const lessonsToInsert = [];
  const assignmentsToInsert = [];

  for (const course of createdCourses) {
    // Thêm 4 bài mẫu cho mỗi khóa học
    [1, 2, 3, 4].forEach((num) => {
      const isFree = num === 1;
      const lessonObj = {
        _id: new mongoose.Types.ObjectId(), // Tạo trước ID
        courseRef: course._id,
        sectionIndex: num <= 2 ? 1 : 2,
        sectionTitle: num <= 2 ? "Phần 1: Căn bản" : "Phần 2: Nâng cao",
        title: `Bài ${num}: Nội dung chi tiết của bài ${num}`,
        order: num,
        date: new Date(Date.now() + 86400000 * num),
        meetUrl: "https://meet.google.com/test-link",
        isFreePreview: isFree,
        materials: []
      };
      lessonsToInsert.push(lessonObj);

      // Nếu là Bài 1, thêm 1 Quiz và 1 Essay
      if (num === 1) {
        assignmentsToInsert.push({
          lessonRef: lessonObj._id,
          courseRef: course._id,
          title: "Quiz: Kiểm tra kiến thức Bài 1",
          type: "quiz",
          questions: [
            { questionText: "TOEIC là viết tắt của từ gì?", options: ["Test of English for International Communication", "Test of English for IT", "The English International", "Tất cả đều sai"], correctAnswerIndex: 0, explanation: "Đáp án A là chuẩn." },
            { questionText: "Chứng chỉ TOEIC có thời hạn bao lâu?", options: ["1 năm", "2 năm", "Vĩnh viễn", "5 năm"], correctAnswerIndex: 1, explanation: "Chứng chỉ TOEIC có thời hạn 2 năm." }
          ]
        });

        assignmentsToInsert.push({
          lessonRef: lessonObj._id,
          courseRef: course._id,
          title: "Bài tập tự luận: Viết một đoạn văn giới thiệu bản thân",
          type: "essay",
          essayDescription: "<p>Hãy viết một đoạn văn ngắn (tối thiểu 5 câu) bằng tiếng Anh để giới thiệu về tên, tuổi, sở thích và mục tiêu học TOEIC của bạn.</p><p>Bạn có thể gõ trực tiếp hoặc nộp file Word (.docx).</p>"
        });
      }
    });
  }
  await Lesson.insertMany(lessonsToInsert);
  await Assignment.insertMany(assignmentsToInsert);
  console.log(`   ✅ Đã tạo ${lessonsToInsert.length} bài học và ${assignmentsToInsert.length} bài tập.`);

  /* ──── SUMMARY ──── */
  const userCount = await User.countDocuments();
  const courseCount = await Course.countDocuments();
  const catCount = await Category.countDocuments();
  const lessonCount = await Lesson.countDocuments();
  const assignmentCount = await Assignment.countDocuments();

  console.log("\n════════════════════════════════════════════════");
  console.log("📊 KẾT QUẢ SEED:");
  console.log(`   Users      : ${userCount}`);
  console.log(`   Categories : ${catCount}`);
  console.log(`   Courses    : ${courseCount}`);
  console.log(`   Lessons    : ${lessonCount}`);
  console.log(`   Assignments: ${assignmentCount}`);
  console.log("════════════════════════════════════════════════");
  console.log(`\n🔐 Mật khẩu chung cho tất cả tài khoản seed: ${DEFAULT_PASSWORD}`);
  console.log("   Tài khoản admin: pdquang050203@gmail.com");
  console.log("   Tài khoản GV:    hatrang.tzone@gmail.com, minhtuan.tzone@gmail.com, ...");
  console.log("   Tài khoản HS:    nguyenvana.student@gmail.com, ...\n");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
