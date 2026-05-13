import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCourseLessons, updateCourseProgress } from "../../api/enrollmentsApi";
import { fetchAssignmentsByLesson } from "../../api/assignmentsApi";
import { submitReview } from "../../api/reviewsApi";
import StarRating from "../../components/StarRating";
import "./LearningPage.css";

// SVG Icons
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconCheckCircle = ({ checked }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={checked ? "#00a260" : "none"} stroke={checked ? "#00a260" : "#cbd5e1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    {checked && <polyline points="22 4 12 14.01 9 11.01" stroke="white" strokeWidth="3"></polyline>}
  </svg>
);
const IconVideo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const IconCalendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const IconFile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const IconChevronDown = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function LearningPage() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho việc học
  const [activeSection, setActiveSection] = useState(1);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  
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
            loadAssignments(res.curriculum[0].lessons[0]._id);
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
      setAssignments([]);
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
    loadAssignments(lesson._id);
  };

  const toggleSection = (sectionIndex) => {
    setActiveSection(prev => prev === sectionIndex ? null : sectionIndex);
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
      toast.success("Tuyệt vời! Đã lưu tiến độ.");
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
        toast.success("Cảm ơn bạn đã gửi đánh giá!");
        setComment("");
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
    return (
      <div className="tz-learning-loading">
        <div className="tz-spinner"></div>
        <p>Đang tải không gian học tập...</p>
      </div>
    );
  }

  return (
    <div className="tz-learning-layout">
      {/* Sidebar */}
      <aside className="tz-learning-sidebar">
        <div className="tz-ls-header">
          <Link to="/dashboard" className="tz-ls-back">
            <IconArrowLeft /> Quay lại Dashboard
          </Link>
          <h2 className="tz-ls-course-title">{courseInfo?.title}</h2>
          {courseInfo?.isTrial && <span className="tz-ls-trial-badge">Đang học thử</span>}
          
          <div className="tz-ls-progress-container">
            <div className="tz-ls-progress-info">
              <span>Tiến độ học tập</span>
              <strong>{Math.round(courseInfo?.progress || 0)}%</strong>
            </div>
            <div className="tz-ls-progress-bar">
              <div className="tz-ls-progress-fill" style={{ width: `${courseInfo?.progress || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="tz-ls-curriculum">
          {curriculum.length === 0 ? (
            <div className="tz-ls-empty">Khóa học đang được cập nhật bài học.</div>
          ) : (
            curriculum.map((section) => {
              const isOpen = activeSection === section.sectionIndex;
              return (
                <div className="tz-ls-section" key={section.sectionIndex}>
                  <div 
                    className={`tz-ls-section-header ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleSection(section.sectionIndex)}
                  >
                    <div>
                      <h4 className="tz-ls-section-title">Chương {section.sectionIndex}: {section.sectionTitle}</h4>
                      <span className="tz-ls-section-meta">{section.lessons.length} bài học</span>
                    </div>
                    <IconChevronDown open={isOpen} />
                  </div>
                  
                  <div className={`tz-ls-section-body ${isOpen ? 'open' : ''}`}>
                    {section.lessons.map(lesson => {
                      const isActive = activeLesson?._id === lesson._id;
                      const isCompleted = completedLessons.has(lesson._id);
                      return (
                        <div 
                          key={lesson._id}
                          className={`tz-ls-lesson-item ${isActive ? 'active' : ''}`}
                          onClick={() => handleLessonSelect(lesson, section.sectionIndex)}
                        >
                          <div className="tz-ls-lesson-icon">
                            <IconCheckCircle checked={isCompleted} />
                          </div>
                          <span className="tz-ls-lesson-name">{lesson.title}</span>
                          {lesson.isFreePreview && <span className="tz-ls-preview-tag">Free</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="tz-learning-main">
        <div className="tz-lm-container">
          {activeLesson ? (
            <>
              <div className="tz-lm-lesson-header">
                {activeLesson.isFreePreview && <span className="tz-lm-preview-badge">Bài học miễn phí (Học thử)</span>}
                <h1 className="tz-lm-lesson-title">{activeLesson.title}</h1>
              </div>

              <div className="tz-lm-cards-grid">
                {/* Lịch học Card */}
                <div className="tz-lm-card">
                  <div className="tz-lm-card-icon bg-blue"><IconCalendar /></div>
                  <div className="tz-lm-card-content">
                    <h3>Thời gian diễn ra</h3>
                    <p>{activeLesson.date ? new Date(activeLesson.date).toLocaleString("vi-VN") : "Chưa cập nhật thời gian"}</p>
                  </div>
                </div>

                {/* Phòng học Card */}
                <div className="tz-lm-card">
                  <div className="tz-lm-card-icon bg-green"><IconVideo /></div>
                  <div className="tz-lm-card-content">
                    <h3>Phòng học Trực tuyến</h3>
                    {activeLesson.meetUrl ? (
                      <a href={activeLesson.meetUrl} target="_blank" rel="noreferrer" className="tz-lm-btn-meet">
                        <IconVideo /> Vào lớp Google Meet
                      </a>
                    ) : (
                      <p className="tz-lm-no-link">Giảng viên chưa mở link phòng học.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tài liệu đính kèm */}
              {activeLesson.materials && activeLesson.materials.length > 0 && (
                <div className="tz-lm-section">
                  <h3 className="tz-lm-section-title"><IconFile /> Tài liệu bài học</h3>
                  <div className="tz-lm-materials-grid">
                    {activeLesson.materials.map((mat, idx) => (
                      <a key={idx} href={mat.url} target="_blank" rel="noreferrer" className="tz-lm-material-card">
                        <div className="tz-lm-material-icon">
                          <IconFile />
                        </div>
                        <div className="tz-lm-material-info">
                          <span className="tz-lm-material-name">{mat.title || "Tài liệu đính kèm"}</span>
                          <span className="tz-lm-material-action">Tải xuống</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bài tập */}
              {assignments.length > 0 && (
                <div className="tz-lm-section">
                  <h3 className="tz-lm-section-title"><IconEdit /> Bài tập về nhà</h3>
                  <div className="tz-lm-assignments-list">
                    {assignments.map(ass => (
                      <div className="tz-lm-assignment-card" key={ass._id}>
                        <div className="tz-lm-ass-info">
                          <span className={`tz-lm-ass-type ${ass.type === 'quiz' ? 'bg-orange' : 'bg-blue'}`}>
                            {ass.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                          </span>
                          <span className="tz-lm-ass-title">{ass.title}</span>
                        </div>
                        <Link to={`/learn/${courseId}/assignment/${ass._id}`} className="tz-lm-btn-do-task">
                          Làm bài ngay
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút hoàn thành */}
              <div className="tz-lm-complete-section">
                <button 
                  className={`tz-lm-btn-complete ${completedLessons.has(activeLesson._id) ? 'completed' : ''}`}
                  onClick={handleComplete}
                  disabled={completedLessons.has(activeLesson._id)}
                >
                  <IconCheckCircle checked={completedLessons.has(activeLesson._id)} />
                  {completedLessons.has(activeLesson._id) ? "Đã hoàn thành bài học này" : "Đánh dấu hoàn thành"}
                </button>
              </div>
            </>
          ) : (
            <div className="tz-lm-empty-state">
              <div className="tz-lm-empty-icon">📚</div>
              <h2>Chọn bài học để bắt đầu</h2>
              <p>Hãy chọn một bài học trong menu bên trái để xem nội dung, link học trực tuyến và bài tập nhé.</p>
            </div>
          )}

          {/* Đánh giá khóa học */}
          {!courseInfo?.isTrial && (
            <div className="tz-lm-review-box">
              <div className="tz-lm-review-header">
                <h3>Đánh giá khóa học</h3>
                <p>Chia sẻ cảm nhận để giúp các bạn khác hiểu thêm về khóa học nhé!</p>
              </div>
              <form onSubmit={handleReviewSubmit} className="tz-lm-review-form">
                <div className="tz-lm-rating-row">
                  <span className="tz-lm-rating-label">Mức độ hài lòng:</span>
                  <StarRating rating={rating} setRating={setRating} interactive={true} />
                </div>
                <textarea 
                  className="tz-lm-textarea"
                  rows="4" 
                  placeholder="Khóa học này như thế nào? Giảng viên dạy ra sao?..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                ></textarea>
                <div className="tz-lm-review-actions">
                  <button type="submit" className="tz-lm-btn-submit" disabled={submittingReview}>
                    {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
