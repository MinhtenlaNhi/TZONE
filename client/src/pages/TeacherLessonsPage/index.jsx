import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetchJson, apiPath } from "../../api/base";
import { createTeacherSection, createTeacherLesson, uploadLessonMaterial, createLessonAssignment, updateLessonAssignment } from "../../api/teacherApi";
import { toast } from "react-toastify";
import "./TeacherLessons.css";

// SVG Icons
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconFolder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);
const IconBookOpen = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const IconFileText = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const IconUploadCloud = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
);
const IconCheckSquare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const IconChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
);
const IconCheckCircleSolid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
);

export default function TeacherLessonsPage() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [expandedLessons, setExpandedLessons] = useState({});
  
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
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [assignmentData, setAssignmentData] = useState({ type: "essay", title: "", description: "", questions: [] });

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

  const toggleLessonExpand = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
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

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingAssignmentId) {
        res = await updateLessonAssignment(activeLessonId, editingAssignmentId, assignmentData);
      } else {
        res = await createLessonAssignment(activeLessonId, assignmentData);
      }
      
      if (res.success) {
        toast.success(editingAssignmentId ? "Cập nhật bài tập thành công" : "Tạo bài tập thành công");
        setShowAssignmentModal(false);
        setAssignmentData({ type: "essay", title: "", description: "", questions: [] });
        setEditingAssignmentId(null);
        loadCourseData();
      } else {
        toast.error(res.message || "Lỗi lưu bài tập");
      }
    } catch { toast.error("Lỗi lưu bài tập"); }
  };

  const handleEditAssignment = (lessonId, assignment) => {
    setActiveLessonId(lessonId);
    setEditingAssignmentId(assignment._id);
    setAssignmentData({
      type: assignment.type,
      title: assignment.title,
      description: assignment.essayDescription || "",
      questions: assignment.questions || []
    });
    setShowAssignmentModal(true);
  };
  
  const openCreateAssignmentModal = (lessonId) => {
    setActiveLessonId(lessonId);
    setEditingAssignmentId(null);
    setAssignmentData({ type: "essay", title: "", description: "", questions: [] });
    setShowAssignmentModal(true);
  };

  const handleAddQuestion = () => {
    setAssignmentData({
      ...assignmentData,
      questions: [
        ...assignmentData.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
      ]
    });
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQs = [...assignmentData.questions];
    newQs[index][field] = value;
    setAssignmentData({ ...assignmentData, questions: newQs });
  };

  const handleRemoveQuestion = (index) => {
    const newQs = [...assignmentData.questions];
    newQs.splice(index, 1);
    setAssignmentData({ ...assignmentData, questions: newQs });
  };

  return (
    <div className="tz-tl-page">
      <div className="tz-tl-container">
        <Link to="/teacher/courses" className="tz-tl-back">
          <IconArrowLeft /> Danh sách khóa học
        </Link>

        <header className="tz-tl-banner">
          <div className="tz-tl-banner-left">
            <div className="tz-tl-header-icon-box">
              <IconBookOpen />
            </div>
            <div className="tz-tl-banner-content">
              <div className="tz-tl-header-meta">QUẢN LÝ GIÁO TRÌNH</div>
              <h1 className="tz-tl-title">{course?.title || "Đang tải..."}</h1>
              <p className="tz-tl-header-desc">Quản lý nội dung, bài học và các hoạt động học tập</p>
              <button onClick={() => setShowSecModal(true)} className="tz-tl-btn-primary tz-tl-add-chap-btn">
                <IconPlus /> Thêm Chương Mới
              </button>
            </div>
          </div>
          <div className="tz-tl-banner-right">
             <svg width="300" height="140" viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 140C20 140 60 40 180 40C300 40 300 140 300 140H20Z" fill="#f0fdf4"/>
                <circle cx="250" cy="50" r="30" fill="#e6f6ee" />
                <path d="M240 60 L240 40 L260 40" stroke="#a7f3d0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="200" y="100" width="80" height="12" rx="2" fill="#cbd5e1"/>
                <rect x="195" y="115" width="90" height="12" rx="2" fill="#94a3b8"/>
                <rect x="190" y="130" width="100" height="10" rx="2" fill="#64748b"/>
                <path d="M150 140V100C150 90 160 75 170 80C175 85 180 90 185 105C190 120 190 140 190 140Z" fill="#10b981"/>
                <path d="M150 140V100C150 90 140 85 130 90C125 95 120 100 115 110C110 125 110 140 110 140Z" fill="#34d399"/>
                <rect x="145" y="120" width="10" height="20" fill="#059669"/>
                <rect x="135" y="130" width="30" height="10" rx="2" fill="#e2e8f0"/>
             </svg>
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
                      <span className="tz-tl-sec-badge">CHƯƠNG {sec.sectionIndex}</span>
                      <h3 className="tz-tl-sec-title">{sec.sectionTitle}</h3>
                    </div>
                    <div className="tz-tl-sec-actions">
                      <button className="tz-tl-btn-icon-more">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                      </button>
                      <button 
                        onClick={() => { setActiveSecIdx(sec.sectionIndex); setShowLessonModal(true); }} 
                        className="tz-tl-btn-outline-sm"
                      >
                        <IconPlus /> Thêm Bài Học
                      </button>
                    </div>
                  </div>
                  
                  <div className="tz-tl-lessons-list">
                    {sec.lessons.length === 0 ? (
                      <p className="tz-tl-no-lesson">Chưa có bài học nào trong chương này.</p>
                    ) : (
                      sec.lessons.map(lesson => (
                        <div key={lesson._id} className="tz-tl-lesson-group">
                          <div className="tz-tl-lesson-card">
                            <div className="tz-tl-lesson-main">
                              <div className="tz-tl-lesson-drag-handle">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                              </div>
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
                              <button onClick={() => openCreateAssignmentModal(lesson._id)} className="tz-tl-action-btn" title="Giao bài tập">
                                <IconTag />
                              </button>
                              <Link to={`/teacher/lessons/${lesson._id}/submissions`} className="tz-tl-action-btn grading" title="Chấm bài">
                                <IconCheckSquare /> Chấm bài
                              </Link>
                              {lesson.assignments && lesson.assignments.length > 0 && (
                                <button className="tz-tl-action-btn expander" onClick={() => toggleLessonExpand(lesson._id)}>
                                  {expandedLessons[lesson._id] ? <IconChevronUp /> : <IconChevronDown />}
                                </button>
                              )}
                            </div>
                          </div>
                          {lesson.assignments && lesson.assignments.length > 0 && expandedLessons[lesson._id] && (
                            <div className="tz-tl-lesson-assignments">
                              <div className="tz-tl-lesson-line"></div>
                              <div className="tz-tl-lesson-ass-list">
                                {lesson.assignments.map(ass => (
                                  <div key={ass._id} className="tz-tl-assignment-item" onClick={() => handleEditAssignment(lesson._id, ass)}>
                                    <div className="tz-tl-ass-icon"><IconCheckCircleSolid /></div>
                                    <div className="tz-tl-ass-info">
                                      <span className="tz-tl-ass-title">{ass.title}</span>
                                      <span className={`tz-tl-tag ${ass.type === 'quiz' ? 'bg-orange' : 'bg-blue'}`}>
                                        {ass.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                                      </span>
                                    </div>
                                    <div className="tz-tl-ass-arrow"><IconChevronRight /></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                <h2>{editingAssignmentId ? "Chỉnh sửa Bài Tập" : "Giao Bài Tập"}</h2>
                <button onClick={() => setShowAssignmentModal(false)} className="tz-tl-modal-close">&times;</button>
              </div>
              <form onSubmit={handleSaveAssignment} className="tz-tl-modal-body">
                <div className="tz-tl-form-row">
                  <div className="tz-tl-form-group half">
                    <label>Loại bài tập</label>
                    <select value={assignmentData.type} onChange={e => setAssignmentData({...assignmentData, type: e.target.value})} disabled={!!editingAssignmentId}>
                      <option value="essay">Tự luận (Học viên nộp text/file)</option>
                      <option value="quiz">Trắc nghiệm (Hệ thống chấm tự động)</option>
                    </select>
                  </div>
                  <div className="tz-tl-form-group half">
                    <label>Tiêu đề bài tập</label>
                    <input type="text" required value={assignmentData.title} onChange={e => setAssignmentData({...assignmentData, title: e.target.value})} placeholder="VD: Bài tập cuối khóa" />
                  </div>
                </div>
                
                {assignmentData.type === "essay" ? (
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
                ) : (
                  <div className="tz-tl-quiz-builder">
                    <div className="tz-tl-qb-header">
                      <label>Danh sách Câu hỏi ({assignmentData.questions.length})</label>
                      <button type="button" className="tz-tl-btn-outline-sm" onClick={handleAddQuestion}>+ Thêm Câu Hỏi</button>
                    </div>
                    <div className="tz-tl-qb-list">
                      {assignmentData.questions.length === 0 ? (
                        <p className="tz-tl-qb-empty">Chưa có câu hỏi nào. Nhấn nút Thêm Câu Hỏi ở trên để bắt đầu.</p>
                      ) : (
                        assignmentData.questions.map((q, qIndex) => (
                          <div key={qIndex} className="tz-tl-qb-item">
                            <div className="tz-tl-qb-item-header">
                              <h4>Câu {qIndex + 1}</h4>
                              <button type="button" className="tz-tl-qb-remove" onClick={() => handleRemoveQuestion(qIndex)}>&times;</button>
                            </div>
                            <div className="tz-tl-form-group">
                              <input type="text" placeholder="Nhập nội dung câu hỏi..." value={q.questionText} required onChange={e => handleUpdateQuestion(qIndex, "questionText", e.target.value)} />
                            </div>
                            <div className="tz-tl-qb-options">
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="tz-tl-qb-option">
                                  <input 
                                    type="radio" 
                                    name={`correct_${qIndex}`} 
                                    checked={q.correctAnswerIndex === oIndex} 
                                    onChange={() => handleUpdateQuestion(qIndex, "correctAnswerIndex", oIndex)} 
                                    required
                                    title="Chọn làm đáp án đúng"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder={`Lựa chọn ${oIndex + 1}`} 
                                    value={opt} 
                                    required 
                                    onChange={e => {
                                      const newOpts = [...q.options];
                                      newOpts[oIndex] = e.target.value;
                                      handleUpdateQuestion(qIndex, "options", newOpts);
                                    }} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" className="tz-tl-btn-primary full-width" disabled={assignmentData.type === 'quiz' && assignmentData.questions.length === 0}>
                  {editingAssignmentId ? "Lưu Thay Đổi" : "Tạo Bài Tập"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
