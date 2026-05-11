import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetchJson, apiFetch, apiPath } from "../../api/base";
import { addToCart } from "../../api/cartApi";
import { fetchCourseReviews } from "../../api/reviewsApi";
import { getAuth } from "../../auth/auth";
import StarRating from "../../components/StarRating";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "../../pages/Home/styles.css";
import "./CoursePublicDetail.css";

export default function CoursePublicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const [resCourse, resReviews] = await Promise.all([
          apiFetchJson(`/api/courses/${id}`),
          fetchCourseReviews(id)
        ]);

        if (resCourse.success) {
          setCourse(resCourse.course);
        } else {
          setError(resCourse.message || "Không tìm thấy khóa học");
        }

        if (resReviews.success) {
          setReviews(resReviews.reviews || []);
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!auth) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }
    
    try {
      const res = await addToCart(course.id || course._id);
      if (res.success) {
        toast.success("Đã thêm vào giỏ hàng");
        navigate("/cart");
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi khi thêm vào giỏ hàng");
    }
  };

  const handleTrial = async () => {
    if (!auth) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      const res = await apiFetchJson(`/api/enrollments/course/${course.id || course._id}/trial`, {
        method: "POST"
      });

      if (res.success) {
        toast.success("Đăng ký học thử thành công!");
        navigate(`/learn/${course.id || course._id}`);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi đăng ký học thử");
    }
  };

  if (loading) {
    return (
      <div className="course-public tz-home">
        <PublicHeader />
        <div className="course-detail-loading">
          <div className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#10b981', width: 40, height: 40, borderRadius: '50%', borderStyle: 'solid', borderWidth: 4, animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          Đang tải thông tin khóa học...
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-public tz-home">
        <PublicHeader />
        <div className="course-detail-error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" style={{ margin: '0 auto 1rem' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h2>{error || "Khóa học không tồn tại hoặc đã bị ẩn"}</h2>
          <Link to="/courses" className="btn-back">← Về danh sách khóa học</Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const isEnrollmentOpen = () => {
    if (!course.enrollmentOpenDate || !course.enrollmentCloseDate) return true;
    const now = new Date();
    const open = new Date(course.enrollmentOpenDate);
    const close = new Date(course.enrollmentCloseDate);
    return now >= open && now <= close;
  };

  return (
    <div className="course-public tz-home">
      <PublicHeader />
      <div className="course-public__hero">
        <div className="course-public__hero-content">
          <Link to="/courses" className="course-public__back">← Trở về danh sách</Link>
          <div className="course-public__badge">{course.categoryRef?.name || course.categoryId}</div>
          <h1 className="course-public__title">{course.title}</h1>
          <p className="course-public__short-desc">Khóa học {course.categoryRef?.name} chất lượng cao cùng {course.instructor}</p>
          
          <div className="cp-detail__rating-summary">
            <span className="rating-score">{course.rating || 0}</span>
            <StarRating rating={Math.round(course.rating || 0)} />
            <span className="rating-count">({course.reviewCount || 0} đánh giá)</span>
          </div>

          <div className="course-public__meta">
            <span>🎓 {course.enrolled} học viên đã tham gia</span>
            <span>🕒 {course.totalSessions} buổi ({course.sessionDuration} phút/buổi)</span>
          </div>
        </div>
      </div>

      <div className="course-public__layout">
        <div className="course-public__main">
          <h2>Giới thiệu khóa học</h2>
          <div 
            className="course-public__description"
            dangerouslySetInnerHTML={{ __html: course.description || "<p>Chưa có mô tả chi tiết.</p>" }}
          />

          <h2>Lịch học & Khai giảng</h2>
          <div className="course-public__schedule-box">
            <p><strong>Ngày khai giảng dự kiến:</strong> {course.startDate || "Liên hệ"}</p>
            <p><strong>Lịch học trong tuần:</strong> {course.schedule}</p>
          </div>

          {/* REVIEWS SECTION moved to main body */}
          <div className="cp-detail__reviews">
            <h2>Đánh giá từ Học viên</h2>
            {reviews.length === 0 ? (
              <p className="no-reviews">Chưa có đánh giá nào cho khóa học này.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map(rev => (
                  <div key={rev._id} className="review-card">
                    <div className="reviewer-info">
                      <img 
                        src={rev.userRef?.avatar ? `${import.meta.env.VITE_API_URL || ""}${rev.userRef.avatar}` : "/default-avatar.png"} 
                        alt="avatar" 
                        className="reviewer-avatar" 
                        onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + (rev.userRef?.name || "U"); }}
                      />
                      <div className="reviewer-meta">
                        <strong>{rev.userRef?.name || "Học viên ẩn danh"}</strong>
                        <span className="review-date">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      <StarRating rating={rev.rating} />
                    </div>
                    {rev.comment && <p className="review-comment">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <aside className="course-public__sidebar">
          <div className="course-public__buy-card">
            <div className="course-public__buy-img">
              {course.thumbnail ? (
                <img src={`${import.meta.env.VITE_API_URL || ""}${course.thumbnail}`} alt={course.title} />
              ) : (
                <div className="img-placeholder">TZONE</div>
              )}
            </div>
            
            <div className="course-public__buy-content">
              <div className="course-public__price">{course.price || "Liên hệ"}</div>
              
              <ul className="course-public__features">
                <li>✓ Truy cập toàn bộ bài giảng trực tiếp</li>
                <li>✓ {course.trialLessonCount} buổi học thử miễn phí</li>
                <li>✓ Hỗ trợ giải đáp 24/7 từ giáo viên</li>
                <li>✓ Tài liệu độc quyền TZONE</li>
              </ul>

              {isEnrollmentOpen() ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="course-public__btn-enroll" onClick={handleEnroll}>
                    Đăng ký học ngay
                  </button>
                  <button 
                    className="course-public__btn-trial" 
                    onClick={handleTrial}
                  >
                    Học thử miễn phí
                  </button>
                </div>
              ) : (
                <button className="course-public__btn-closed" disabled>
                  Đã đóng đăng ký
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
      <PublicFooter />
    </div>
  );
}
