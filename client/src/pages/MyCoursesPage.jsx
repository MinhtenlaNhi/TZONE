import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchMyEnrollments } from "../api/enrollmentsApi";
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
    return <div className="my-courses-loading">Đang tải...</div>;
  }

  return (
    <div className="my-courses">
      <div className="my-courses__header">
        <h1>Khóa học của tôi</h1>
        <p>Danh sách các khóa học bạn đang tham gia</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="my-courses__empty">
          <p>Bạn chưa tham gia khóa học nào.</p>
          <Link to="/courses" className="btn-primary">Khám phá khóa học ngay</Link>
        </div>
      ) : (
        <div className="my-courses__grid">
          {enrollments.map((enr) => {
            const course = enr.course;
            if (!course) return null;

            return (
              <div className="my-course-card" key={enr._id}>
                <div className="my-course-card__img-wrapper">
                  {course.thumbnail ? (
                    <img src={`${import.meta.env.VITE_API_URL || ""}${course.thumbnail}`} alt={course.title} className="my-course-card__img" />
                  ) : (
                    <div className="my-course-card__img-placeholder">TZONE</div>
                  )}
                  {enr.isTrial && <span className="my-course-card__badge badge-trial">Học thử</span>}
                </div>
                <div className="my-course-card__body">
                  <div className="my-course-card__cat">{course.categoryRef?.name}</div>
                  <h3 className="my-course-card__title">{course.title}</h3>
                  <div className="my-course-card__meta">
                    Giảng viên: {course.instructor || "TZONE"}
                  </div>
                  
                  <div className="course-progress">
                    <div className="progress-info">
                      <span>Tiến độ</span>
                      <span>{Math.round(enr.progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.round(enr.progress)}%` }}></div>
                    </div>
                  </div>

                  <div className="my-course-card__footer">
                    <button onClick={() => navigate(`/learn/${course._id}`)} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                      Vào học
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
