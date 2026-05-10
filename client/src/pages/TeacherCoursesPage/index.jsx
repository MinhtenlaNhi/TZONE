import { useEffect, useState } from "react";
import { fetchTeacherCourses, fetchTeacherCourseStudents } from "../../api/teacherApi";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuth } from "../../auth/auth";
import "./TeacherCourses.css";

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

  return (
    <div className="teacher-page container">
      <header className="teacher-header">
        <h1>Khóa học đang giảng dạy</h1>
      </header>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa phụ trách khóa học nào.</p>
        </div>
      ) : (
        <div className="teacher-courses-grid">
          {courses.map(course => (
            <div key={course._id} className="teacher-course-card">
              <img 
                src={course.thumbnail ? `${import.meta.env.VITE_API_URL || ""}${course.thumbnail}` : "/default-course.png"} 
                alt="thumbnail" 
                className="t-course-img" 
              />
              <div className="t-course-body">
                <h3>{course.title}</h3>
                <p>Mã: <strong>{course.id}</strong></p>
                <div className="t-course-actions">
                  <button className="btn-students" onClick={() => handleViewStudents(course)}>
                    Xem học viên
                  </button>
                  <Link to={`/teacher/courses/${course._id}/lessons`} className="btn-manage-lessons">
                    Giáo trình & Bài học
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <div className="modal-header">
              <h2>Học viên: {selectedCourse?.title}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              {loadingStudents ? (
                <p>Đang tải danh sách...</p>
              ) : students.length === 0 ? (
                <p>Chưa có học viên nào.</p>
              ) : (
                <table className="t-table">
                  <thead>
                    <tr>
                      <th>Học viên</th>
                      <th>Email</th>
                      <th>Ngày Đăng ký</th>
                      <th>Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(enr => (
                      <tr key={enr._id}>
                        <td>{enr.user?.name || "Unknown"}</td>
                        <td>{enr.user?.email}</td>
                        <td>{new Date(enr.enrolledAt).toLocaleDateString("vi-VN")}</td>
                        <td>{enr.isTrial ? <span className="badge-trial">Học thử</span> : <span className="badge-paid">Chính thức</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
