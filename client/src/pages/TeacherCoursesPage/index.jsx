import { useEffect, useState } from "react";
import { fetchTeacherCourses, fetchTeacherCourseStudents } from "../../api/teacherApi";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuth } from "../../auth/auth";
import "./TeacherCourses.css";

// --- SVG Icons ---
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
  </svg>
);

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconUserCircle = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M3,21 h18 C 21,12 3,12 3,21"></path></svg>
);


export default function TeacherCoursesPage() {
  const auth = getAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (!auth || (auth.role !== "teacher" && auth.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetchTeacherCourses();
      if (res.success) {
        setCourses(res.courses);
      } else {
        toast.error("Lỗi lấy danh sách khóa học");
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    setStudents([]);
    try {
      setLoadingStudents(true);
      const res = await fetchTeacherCourseStudents(course._id);
      if (res.success) {
        setStudents(res.students);
      }
    } catch (e) {
      toast.error("Lỗi lấy danh sách học viên");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Helper for Premium UI Cover
  const getCoverInitials = (catName, courseTitle) => {
    const text = catName?.toUpperCase() || courseTitle?.toUpperCase() || "KH";
    if (text.includes("TOEIC B")) return "TB";
    if (text.includes("TOEIC A")) return "TA";
    if (text.includes("TẬP SỰ")) return "TS";
    if (text.includes("SPEAKING")) return "TS";
    return text.substring(0, 2);
  };

  const getCoverColorClass = (catName) => {
    const name = catName?.toUpperCase() || "";
    if (name.includes("TOEIC B")) return "tz-cover-green";
    if (name.includes("TOEIC A")) return "tz-cover-blue";
    if (name.includes("TẬP SỰ")) return "tz-cover-orange";
    if (name.includes("SPEAKING")) return "tz-cover-blue";
    return "tz-cover-blue";
  };

  if (loading) {
    return (
      <div className="tz-tc-loading">
        <div className="tz-spinner"></div>
        <p>Đang tải dữ liệu giảng viên...</p>
      </div>
    );
  }

  return (
    <div className="tz-tc-page">
      <div className="tz-tc-wrapper">
        {/* Hero Banner */}
        <div className="tz-tc-header">
          <div className="tz-tc-header-content">
            <h1>Workspace Giảng Viên</h1>
            <p>Chào mừng bạn trở lại! Bạn đang phụ trách <strong>{courses.length}</strong> lớp học.</p>
          </div>
          <div className="tz-tc-header-graphic">
            <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="200" height="120">
              <path d="M20,100 L40,60 L60,80 L90,30 L120,70 L150,40 L180,90 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinejoin="round"/>
              <circle cx="90" cy="30" r="6" fill="#fff"/>
              <circle cx="150" cy="40" r="6" fill="#fff"/>
              <circle cx="180" cy="90" r="6" fill="#fff"/>
              <rect x="20" y="40" width="30" height="20" rx="4" fill="rgba(255,255,255,0.2)"/>
              <rect x="130" y="80" width="40" height="20" rx="4" fill="rgba(255,255,255,0.2)"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        {courses.length === 0 ? (
          <div className="tz-tc-empty">
            <div className="tz-tc-empty-icon"><IconBook /></div>
            <h2>Chưa có khóa học nào</h2>
            <p>Hiện tại bạn chưa được phân công phụ trách khóa học nào. Vui lòng liên hệ Quản trị viên.</p>
          </div>
        ) : (
          <div className="tz-tc-grid">
            {courses.map((course) => {
              const catName = course.categoryRef?.name || course.categoryId;
              const colorClass = getCoverColorClass(catName);
              const coverText = getCoverInitials(catName, course.title);

              return (
                <div key={course._id} className="tz-tc-card">
                  {/* Cover */}
                  <div className={`tz-tc-cover ${colorClass}`}>
                    <div className="tz-tc-cover-text">{coverText}</div>
                    <span className="tz-tc-badge-dark">Mã lớp: {course.id}</span>
                  </div>

                  {/* Body */}
                  <div className="tz-tc-body">
                    <span className="tz-tc-category-tag">{catName || "Khóa học"}</span>
                    <h3 className="tz-tc-title">{course.title}</h3>
                    
                    <div className="tz-tc-actions">
                      <button className="tz-tc-btn-outline" onClick={() => handleViewStudents(course)}>
                        <IconUsers /> Xem học viên
                      </button>
                      <Link to={`/teacher/courses/${course._id}/lessons`} className="tz-tc-btn-primary">
                        <IconBook /> Soạn giáo trình
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Students */}
        {showModal && (
          <div className="tz-tc-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="tz-tc-modal" onClick={e => e.stopPropagation()}>
              <div className="tz-tc-modal-header">
                <h2><IconUsers /> Danh sách Học viên</h2>
                <button onClick={() => setShowModal(false)} className="tz-tc-modal-close">
                  <IconX />
                </button>
              </div>
              
              <div className="tz-tc-modal-body">
                <div className="tz-tc-modal-info">
                  <strong>Khóa học:</strong> {selectedCourse?.title}
                </div>
                
                {loadingStudents ? (
                  <div className="tz-tc-loading-small">
                    <div className="tz-spinner"></div>
                    <p>Đang tải danh sách...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="tz-tc-empty-small">
                    <p>Chưa có học viên nào tham gia khóa học này.</p>
                  </div>
                ) : (
                  <div className="tz-tc-table-wrapper">
                    <table className="tz-tc-table">
                      <thead>
                        <tr>
                          <th>Học viên</th>
                          <th>Liên hệ</th>
                          <th>Ngày tham gia</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(enr => (
                          <tr key={enr._id}>
                            <td>
                              <div className="tz-tc-user-cell">
                                <div className="tz-tc-avatar">
                                  {(enr.user?.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <span className="tz-tc-user-name">{enr.user?.name || "Học viên ẩn danh"}</span>
                              </div>
                            </td>
                            <td><span className="tz-tc-email">{enr.user?.email || "—"}</span></td>
                            <td>{new Date(enr.enrolledAt).toLocaleDateString("vi-VN")}</td>
                            <td>
                              {enr.isTrial 
                                ? <span className="tz-tc-status trial">Học thử</span> 
                                : <span className="tz-tc-status paid">Chính thức</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
