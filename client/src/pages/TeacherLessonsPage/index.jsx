import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetchJson, apiPath } from "../../api/base";
import { createTeacherSection, createTeacherLesson, uploadLessonMaterial, createLessonAssignment } from "../../api/teacherApi";
import { toast } from "react-toastify";
import "./TeacherLessons.css";

// SVG Icons
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconFolder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const IconUploadCloud = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
);
const IconPenTool = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
);
const IconCheckSquare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);

export default function TeacherLessonsPage() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  
  // Modals state
  const [showSecModal, setShowSecModal] = useState(false);
  const [secTitle, setSecTitle] = useState("");

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeSecIdx, setActiveSecIdx] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [file, setFile] = useState(null);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ type: "essay", title: "", description: "" });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const resC = await apiFetchJson(apiPath(`/api/courses/${courseId}`));
      if (resC.success) setCourse(resC.course);
      
      const resL = await apiFetchJson(apiPath(`/api/teacher/courses/${courseId}/lessons`));
      if (resL.success) {
        setLessons(resL.curriculum || []);
      }
    } catch (e) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const res = await createTeacherSection(courseId, secTitle);
      if (res.success) {
        toast.success("Thêm chương mới thành công");
        setShowSecModal(false);
        setSecTitle("");
        loadCourseData();
      }
    } catch { toast.error("Lỗi thêm chương"); }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      const res = await createTeacherLesson(courseId, activeSecIdx, lessonTitle, isFreePreview);
      if (res.success) {
        toast.success("Thêm bài học mới thành công");
        setShowLessonModal(false);
        setLessonTitle("");
        loadCourseData();
      }
    } catch { toast.error("Lỗi thêm bài học"); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Chọn file");
    try {
      const res = await uploadLessonMaterial(activeLessonId, file);
      if (res.success) {
        toast.success("Upload thành công");
        setShowUploadModal(false);
        setFile(null);
        loadCourseData();
      }
    } catch { toast.error("Lỗi upload"); }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await createLessonAssignment(activeLessonId, assignmentData);
      if (res.success) {
        toast.success("Tạo bài tập thành công");
        setShowAssignmentModal(false);
        setAssignmentData({ type: "essay", title: "", description: "" });
      } else {
        toast.error(res.message || "Lỗi tạo bài tập");
      }
    } catch { toast.error("Lỗi tạo bài tập"); }
  };

  return (
    <div className="tz-tl-page">
      <div className="tz-tl-container">
        <Link to="/teacher/courses" className="tz-tl-back">
          <IconArrowLeft /> Danh sách Khóa học
        </Link>

        <header className="tz-tl-header">
          <div className="tz-tl-header-meta">Quản lý Giáo trình</div>
          <div className="tz-tl-header-main">
            <h1 className="tz-tl-title">{course?.title || "Đang tải..."}</h1>
            <button onClick={() => setShowSecModal(true)} className="tz-tl-btn-primary">
              <IconFolder /> Thêm Chương Mới
            </button>
          </div>
        </header>

        {loading ? (
          <div className="tz-tl-loading">
            <div className="tz-spinner"></div>
            <p>Đang tải cấu trúc giáo trình...</p>
          </div>
        ) : (
          <div className="tz-tl-curriculum">
            {lessons.length === 0 ? (
              <div className="tz-tl-empty">
                <IconFolder />
                <h3>Chưa có giáo trình</h3>
                <p>Khóa học này chưa có chương học nào. Hãy bắt đầu bằng cách thêm chương mới.</p>
                <button onClick={() => setShowSecModal(true)} className="tz-tl-btn-outline">Thêm Chương Đầu Tiên</button>
              </div>
            ) : (
              lessons.map((sec) => (
                <div key={sec.sectionIndex} className="tz-tl-section">
                  <div className="tz-tl-sec-header">
                    <div className="tz-tl-sec-info">
                      <span className="tz-tl-sec-badge">Chương {sec.sectionIndex}</span>
                      <h3 className="tz-tl-sec-title">{sec.sectionTitle}</h3>
                    </div>
                    <button 
                      onClick={() => { setActiveSecIdx(sec.sectionIndex); setShowLessonModal(true); }} 
                      className="tz-tl-btn-outline-sm"
                    >
                      + Thêm Bài Học
                    </button>
                  </div>
                  
                  <div className="tz-tl-lessons-list">
                    {sec.lessons.length === 0 ? (
                      <p className="tz-tl-no-lesson">Chưa có bài học nào trong chương này.</p>
                    ) : (
                      sec.lessons.map(lesson => (
                        <div key={lesson._id} className="tz-tl-lesson-card">
                          <div className="tz-tl-lesson-main">
                            <div className="tz-tl-lesson-icon"><IconFileText /></div>
                            <div className="tz-tl-lesson-info">
                              <span className="tz-tl-lesson-name">Bài {lesson.order}: {lesson.title}</span>
                              <div className="tz-tl-lesson-tags">
                                {lesson.isFreePreview && <span className="tz-tl-tag bg-orange">Học thử</span>}
                                {lesson.meetUrl && <span className="tz-tl-tag bg-blue"><IconVideo /> Google Meet</span>}
                                {lesson.materials && lesson.materials.length > 0 && <span className="tz-tl-tag bg-gray">Có tài liệu</span>}
                              </div>
                            </div>
                          </div>
                          <div className="tz-tl-lesson-actions">
                            <Link to={`/teacher/course-links`} className="tz-tl-action-btn" title="Gắn link Meet">
                              <IconVideo />
                            </Link>
                            <button onClick={() => { setActiveLessonId(lesson._id); setShowUploadModal(true); }} className="tz-tl-action-btn" title="Upload tài liệu">
                              <IconUploadCloud />
                            </button>
                            <button onClick={() => { setActiveLessonId(lesson._id); setShowAssignmentModal(true); }} className="tz-tl-action-btn" title="Giao bài tập">
                              <IconPenTool />
                            </button>
                            <Link to={`/teacher/lessons/${lesson._id}/submissions`} className="tz-tl-action-btn grading" title="Chấm bài">
                              <IconCheckSquare /> Chấm bài
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal: Thêm Chương */}
        {showSecModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal">
              <div className="tz-tl-modal-header">
                <h2>Thêm Chương Mới</h2>
                <button onClick={() => setShowSecModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleAddSection} className="tz-tl-modal-body">
                <div className="tz-tl-form-group">
                  <label>Tên chương</label>
                  <input type="text" required value={secTitle} onChange={e => setSecTitle(e.target.value)} placeholder="Nhập tên chương..." />
                </div>
                <button type="submit" className="tz-tl-btn-primary full-width">Lưu Chương Học</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Thêm Bài Học */}
        {showLessonModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal">
              <div className="tz-tl-modal-header">
                <h2>Thêm Bài Học Mới</h2>
                <button onClick={() => setShowLessonModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleAddLesson} className="tz-tl-modal-body">
                <div className="tz-tl-form-group">
                  <label>Tên bài học</label>
                  <input type="text" required value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="Nhập tên bài học..." />
                </div>
                <div className="tz-tl-checkbox-group">
                  <label>
                    <input type="checkbox" checked={isFreePreview} onChange={e => setIsFreePreview(e.target.checked)} />
                    <span className="checkbox-text">Cho phép học thử miễn phí (Trial)</span>
                  </label>
                </div>
                <button type="submit" className="tz-tl-btn-primary full-width">Lưu Bài Học</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Upload */}
        {showUploadModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal">
              <div className="tz-tl-modal-header">
                <h2>Tải Lên Tài Liệu</h2>
                <button onClick={() => setShowUploadModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleUpload} className="tz-tl-modal-body">
                <div className="tz-tl-form-group">
                  <label>Chọn file (Hỗ trợ PDF, DOCX, ZIP - Max 10MB)</label>
                  <div className="tz-tl-file-upload">
                    <input type="file" required onChange={e => setFile(e.target.files[0])} />
                  </div>
                </div>
                <button type="submit" className="tz-tl-btn-primary full-width">Tải Lên</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Tạo Bài Tập */}
        {showAssignmentModal && (
          <div className="tz-tl-modal-overlay">
            <div className="tz-tl-modal modal-large">
              <div className="tz-tl-modal-header">
                <h2>Giao Bài Tập</h2>
                <button onClick={() => setShowAssignmentModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleCreateAssignment} className="tz-tl-modal-body">
                <div className="tz-tl-form-row">
                  <div className="tz-tl-form-group half">
                    <label>Loại bài tập</label>
                    <select value={assignmentData.type} onChange={e => setAssignmentData({...assignmentData, type: e.target.value})}>
                      <option value="essay">Tự luận (Học viên nộp text/file)</option>
                      <option value="quiz" disabled>Trắc nghiệm (Chưa khả dụng)</option>
                    </select>
                  </div>
                  <div className="tz-tl-form-group half">
                    <label>Tiêu đề bài tập</label>
                    <input type="text" required value={assignmentData.title} onChange={e => setAssignmentData({...assignmentData, title: e.target.value})} placeholder="VD: Bài tập cuối khóa" />
                  </div>
                </div>
                <div className="tz-tl-form-group">
                  <label>Mô tả đề bài / Yêu cầu</label>
                  <textarea 
                    rows="6" 
                    required 
                    value={assignmentData.description} 
                    onChange={e => setAssignmentData({...assignmentData, description: e.target.value})}
                    placeholder="Nhập yêu cầu chi tiết của bài tập..."
                  ></textarea>
                </div>
                <button type="submit" className="tz-tl-btn-primary full-width">Tạo Bài Tập</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
