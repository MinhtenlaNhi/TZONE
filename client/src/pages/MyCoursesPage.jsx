import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchMyEnrollments } from "../api/enrollmentsApi";
import { FiUser, FiBookOpen, FiStar } from "react-icons/fi";
import { MdGroups } from "react-icons/md";
import "./MyCoursesPage.css";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const res = await fetchMyEnrollments();
        if (res.success) {
          setEnrollments(res.enrollments);
        } else {
          toast.error("Lỗi tải danh sách khóa học");
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadEnrollments();
  }, []);

  if (loading) {
    return <div className="mc-loading">Đang tải dữ liệu...</div>;
  }

  // Hàm quyết định theme màu dựa trên tên danh mục
  const getThemeClass = (categoryName) => {
    if (!categoryName) return "mc-theme-blue";
    const name = categoryName.toUpperCase();
    if (name.includes("TOEIC A")) return "mc-theme-orange";
    if (name.includes("TẬP SỰ")) return "mc-theme-purple";
    // Mặc định cứ phân bổ màu xen kẽ nếu muốn, nhưng dựa vào tên thì:
    if (name.includes("TOEIC B")) {
      // Để tạo sự đa dạng, bạn có thể mix, tạm gán TOEIC B là blue
      return "mc-theme-blue";
    }
    return "mc-theme-teal"; 
  };

  // Hàm lấy chữ cái đầu hoặc icon cho Avatar
  const getAvatarContent = (title, categoryName) => {
    if (categoryName && categoryName.toUpperCase().includes("TẬP SỰ")) {
      return <MdGroups className="mc-avatar-icon" />;
    }
    if (!title) return "T";
    return title.charAt(0).toUpperCase();
  };

  return (
    <div className="mc-page">
      <div className="mc-header">
        <div className="mc-header-content">
          <h1>Khóa học của tôi</h1>
          <p>Danh sách các khóa học bạn đang tham gia</p>
        </div>
        <div className="mc-header-illustration">
          <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="200" height="120">
            {/* Background Blob */}
            <path d="M10,80 Q30,40 80,50 T160,30 Q190,60 180,100 Q150,130 90,110 T10,80 Z" fill="#f0fdf4" />
            {/* Books */}
            <rect x="110" y="70" width="50" height="12" rx="2" fill="#818cf8" />
            <rect x="105" y="82" width="60" height="12" rx="2" fill="#34d399" />
            <rect x="100" y="94" width="70" height="12" rx="2" fill="#60a5fa" />
            {/* Graduation Cap */}
            <path d="M135,40 L100,55 L135,70 L170,55 Z" fill="#10b981" />
            <path d="M110,60 L110,75 C110,80 160,80 160,75 L160,60" fill="none" stroke="#059669" strokeWidth="3" />
            <line x1="160" y1="58" x2="160" y2="75" stroke="#f59e0b" strokeWidth="2" />
            {/* Plant Pot */}
            <path d="M40,85 L60,85 L55,106 L45,106 Z" fill="#14b8a6" />
            {/* Plant Leaves */}
            <path d="M50,85 Q35,65 45,55 Q55,65 50,85" fill="#10b981" />
            <path d="M50,85 Q65,65 55,55 Q45,65 50,85" fill="#34d399" />
            <path d="M50,85 Q40,40 50,30 Q60,40 50,85" fill="#059669" />
            {/* Sparkles */}
            <circle cx="180" cy="40" r="2" fill="#a7f3d0" />
            <circle cx="90" cy="30" r="3" fill="#a7f3d0" />
            <circle cx="30" cy="60" r="2" fill="#a7f3d0" />
          </svg>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="mc-empty">
          <p>Bạn chưa tham gia khóa học nào.</p>
          <Link to="/courses" className="btn-primary">Khám phá khóa học ngay</Link>
        </div>
      ) : (
        <div className="mc-grid">
          {enrollments.map((enr, index) => {
            const course = enr.course;
            if (!course) return null;

            // Xoay vòng theme để đa dạng nếu là TOEIC B (vì TOEIC B có màu teal và blue trong mẫu)
            let themeClass = getThemeClass(course.categoryRef?.name);
            if (themeClass === "mc-theme-blue" && index % 2 === 1) {
              themeClass = "mc-theme-teal";
            }

            // Nếu khóa học Trial, ghi đè màu thành cam
            if (enr.isTrial) {
              themeClass = "mc-theme-orange";
            }

            const progress = Math.round(enr.progress) || 0;

            return (
              <div className={`mc-card ${themeClass}`} key={enr._id}>
                {enr.isTrial && (
                  <div className="mc-trial-ribbon">
                    <FiStar /> Học thử
                  </div>
                )}
                
                <div className="mc-card-header">
                  {/* SVG Wave */}
                  <svg className="mc-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="currentColor" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,112C384,128,480,192,576,202.7C672,213,768,171,864,154.7C960,139,1056,149,1152,170.7C1248,192,1344,224,1392,240L1440,256L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                  </svg>
                  
                  {/* Avatar */}
                  <div className="mc-avatar">
                    <div className="mc-avatar-inner">
                      {getAvatarContent(course.title, course.categoryRef?.name)}
                    </div>
                  </div>
                </div>

                <div className="mc-card-body">
                  <span className="mc-category-tag">{course.categoryRef?.name || "Khóa học"}</span>
                  <h3 className="mc-course-title" title={course.title}>{course.title}</h3>
                  <div className="mc-instructor">
                    <FiUser className="mc-icon-user" /> Giảng viên: {course.instructor || "TZONE"}
                  </div>
                  
                  <div className="mc-progress-section">
                    <div className="mc-progress-header">
                      <span className="mc-progress-label">Tiến độ</span>
                      <span className="mc-progress-percent">{progress}%</span>
                    </div>
                    <div className="mc-progress-track">
                      <div className="mc-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <button className="mc-action-btn" onClick={() => navigate(`/learn/${course._id}`)}>
                    <FiBookOpen /> Vào học
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
