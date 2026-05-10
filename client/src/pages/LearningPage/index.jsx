import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCourseLessons, updateCourseProgress } from "../../api/enrollmentsApi";
import { fetchAssignmentsByLesson } from "../../api/assignmentsApi";
import { submitReview } from "../../api/reviewsApi";
import StarRating from "../../components/StarRating";
import "./LearningPage.css";

export default function LearningPage() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho việc học
  const [activeSection, setActiveSection] = useState(1);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set()); // Lưu ID các bài đã hoàn thành
  
  // Assignment State
  const [assignments, setAssignments] = useState([]);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchCourseLessons(courseId);
        if (res.success) {
          setCourseInfo({
            title: res.courseTitle,
            isTrial: res.isTrial,
            progress: res.progress || 0
          });
          setCurriculum(res.curriculum || []);
          
          if (res.curriculum?.length > 0 && res.curriculum[0].lessons.length > 0) {
            setActiveLesson(res.curriculum[0].lessons[0]);
            setActiveSection(res.curriculum[0].sectionIndex);
          }
        } else {
          toast.error(res.message || "Lỗi tải bài học");
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  const calculateTotalLessons = () => {
    return curriculum.reduce((total, sec) => total + sec.lessons.length, 0);
  };

  const loadAssignments = async (lessonId) => {
    try {
      const res = await fetchAssignmentsByLesson(lessonId);
      if (res.success) {
        setAssignments(res.assignments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLessonSelect = (lesson, sectionIndex) => {
    setActiveLesson(lesson);
    setActiveSection(sectionIndex);
    loadAssignments(lesson._id);
  };

  const handleComplete = async () => {
    if (!activeLesson) return;

    const newCompleted = new Set(completedLessons);
    newCompleted.add(activeLesson._id);
    setCompletedLessons(newCompleted);

    const total = calculateTotalLessons();
    const newProgress = total > 0 ? (newCompleted.size / total) * 100 : 0;

    try {
      await updateCourseProgress(courseId, newProgress);
      setCourseInfo(prev => ({ ...prev, progress: newProgress }));
      toast.success("Đã lưu tiến độ!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const res = await submitReview(courseId, rating, comment);
      if (res.success) {
        toast.success("Đã gửi đánh giá thành công!");
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="learning-loading">Đang tải dữ liệu bài học...</div>;
  }

  return (
    <div className="learning-page">
      {/* Sidebar */}
      <aside className="learning-sidebar">
        <div className="learning-sidebar__header">
          <Link to="/my-courses" className="back-link">← Trở về</Link>
          <h2 className="course-title">{courseInfo?.title}</h2>
          {courseInfo?.isTrial && <span className="trial-badge">Đang học thử</span>}
          <div className="progress-bar-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${courseInfo?.progress || 0}%` }}></div>
            </div>
            <span className="progress-text">{Math.round(courseInfo?.progress || 0)}% hoàn thành</span>
          </div>
        </div>

        <div className="curriculum-list">
          {curriculum.length === 0 ? (
            <p className="p-4 text-sm text-gray">Khóa học chưa có bài học nào.</p>
          ) : (
            curriculum.map((section) => (
              <div className="section-group" key={section.sectionIndex}>
                <div 
                  className={`section-header ${activeSection === section.sectionIndex ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.sectionIndex)}
                >
                  <span className="section-title">Chương {section.sectionIndex}: {section.sectionTitle}</span>
                  <span className="section-count">{section.lessons.length} bài</span>
                </div>
                
                {activeSection === section.sectionIndex && (
                  <div className="section-lessons">
                    {section.lessons.map(lesson => (
                      <div 
                        key={lesson._id}
                        className={`lesson-item ${activeLesson?._id === lesson._id ? 'active' : ''} ${completedLessons.has(lesson._id) ? 'completed' : ''}`}
                        onClick={() => handleLessonSelect(lesson, section.sectionIndex)}
                      >
                        <span className="lesson-icon">
                          {completedLessons.has(lesson._id) ? "✅" : "📄"}
                        </span>
                        <span className="lesson-title">{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="learning-main">
        {activeLesson ? (
          <div className="lesson-content-area">
            <div className="lesson-header">
              <h1>{activeLesson.title}</h1>
              {activeLesson.isFreePreview && <span className="badge-preview">Free Preview</span>}
            </div>

            <div className="lesson-details">
              <div className="detail-box time-box">
                <h3>Thời gian học</h3>
                <p>{activeLesson.date ? new Date(activeLesson.date).toLocaleString("vi-VN") : "Chưa có lịch cụ thể"}</p>
              </div>

              <div className="detail-box meet-box">
                <h3>Phòng học Trực tuyến</h3>
                {activeLesson.meetUrl ? (
                  <a href={activeLesson.meetUrl} target="_blank" rel="noreferrer" className="btn-meet">
                    Vào lớp học Google Meet
                  </a>
                ) : (
                  <p className="no-link">Giáo viên chưa gắn link lớp học.</p>
                )}
              </div>
            </div>

            {activeLesson.materials && activeLesson.materials.length > 0 && (
              <div className="lesson-materials">
                <h3>Tài liệu đính kèm</h3>
                <ul className="materials-list">
                  {activeLesson.materials.map((mat, idx) => (
                    <li key={idx}>
                      <a href={mat.url} target="_blank" rel="noreferrer" className="material-link">
                        📎 {mat.title || "Tài liệu"}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assignments.length > 0 && (
              <div className="lesson-assignments">
                <h3>Bài tập</h3>
                <div className="assignments-list">
                  {assignments.map(ass => (
                    <div className="assignment-item" key={ass._id}>
                      <div className="assignment-info">
                        <span className="assignment-type badge-preview">{ass.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}</span>
                        <span className="assignment-title">{ass.title}</span>
                      </div>
                      <Link to={`/learn/${courseId}/assignment/${ass._id}`} className="btn-do-assignment">
                        Làm bài
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="lesson-actions">
              <button 
                className="btn-complete" 
                onClick={handleComplete}
                disabled={completedLessons.has(activeLesson._id)}
              >
                {completedLessons.has(activeLesson._id) ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
              </button>
            </div>
          </div>
        ) : (
          <div className="no-lesson-selected">
            <p>Vui lòng chọn bài học ở danh sách bên trái.</p>
          </div>
        )}

        {/* Form Đánh giá Khóa học */}
        {!courseInfo?.isTrial && (
          <div className="course-review-section">
            <h3>Đánh giá khóa học</h3>
            <p className="review-subtitle">Chia sẻ cảm nhận của bạn để giúp các bạn khác hiểu thêm về khóa học nhé!</p>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group rating-group">
                <label>Bạn chấm bao nhiêu sao?</label>
                <StarRating rating={rating} setRating={setRating} interactive={true} />
              </div>
              <div className="form-group">
                <label>Nhận xét của bạn (Không bắt buộc):</label>
                <textarea 
                  rows="4" 
                  placeholder="Khóa học này như thế nào? Giảng viên dạy ra sao?..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
