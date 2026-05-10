import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch, apiPath } from "../../api/base";
import { createTeacherSection, createTeacherLesson, uploadLessonMaterial, createLessonAssignment } from "../../api/teacherApi";
import { toast } from "react-toastify";
import "./TeacherLessons.css";

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
      // Giả sử ta dùng lại API lấy khoá học công khai để lấy title
      const resC = await apiFetch(apiPath(`/api/courses/${courseId}`));
      if (resC.success) setCourse(resC.course);
      
      // Lấy lessons: Do API adminCourses.js không có get lessons theo courseId (chỉ get public),
      // Tạm dùng API của admin categories hoặc viết thêm GET lessons. 
      // Do trong Plan chưa định nghĩa GET /api/teacher/courses/:id/lessons (chỉ dùng chung với Public)
      const resL = await apiFetch(apiPath(`/api/courses/${courseId}/lessons`));
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
      }
    } catch { toast.error("Lỗi tạo bài tập"); }
  };

  return (
    <div className="teacher-page container">
      <header className="teacher-header">
        <Link to="/teacher/courses" className="back-link">← Trở về danh sách Khóa học</Link>
        <h1>Giáo trình: {course?.title || "Đang tải..."}</h1>
        <button onClick={() => setShowSecModal(true)} className="btn-primary">Thêm Chương Mới</button>
      </header>

      {loading ? <p>Đang tải giáo trình...</p> : (
        <div className="curriculum-builder">
          {lessons.length === 0 ? <p>Chưa có bài học nào.</p> : (
            lessons.map((sec) => (
              <div key={sec.sectionIndex} className="builder-section">
                <div className="builder-sec-header">
                  <h3>Chương {sec.sectionIndex}: {sec.sectionTitle}</h3>
                  <button onClick={() => { setActiveSecIdx(sec.sectionIndex); setShowLessonModal(true); }} className="btn-sm btn-outline">
                    + Thêm Bài
                  </button>
                </div>
                <div className="builder-lessons">
                  {sec.lessons.map(lesson => (
                    <div key={lesson._id} className="builder-lesson-item">
                      <div className="lesson-info">
                        <strong>Bài {lesson.order}: {lesson.title}</strong>
                        {lesson.isFreePreview && <span className="badge-free">Học thử</span>}
                        {lesson.meetUrl && <span className="badge-meet">Gg Meet</span>}
                      </div>
                      <div className="lesson-actions">
                        <Link to={`/teacher/course-links`} className="btn-action">Link Meet</Link>
                        <button onClick={() => { setActiveLessonId(lesson._id); setShowUploadModal(true); }} className="btn-action">Tài liệu</button>
                        <button onClick={() => { setActiveLessonId(lesson._id); setShowAssignmentModal(true); }} className="btn-action">Giao bài tập</button>
                        <Link to={`/teacher/lessons/${lesson._id}/submissions`} className="btn-action btn-grading">Chấm bài</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Add Section */}
      {showSecModal && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <div className="modal-header">
              <h2>Thêm Chương Mới</h2>
              <button onClick={() => setShowSecModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleAddSection} className="modal-body">
              <div className="form-group">
                <label>Tên chương</label>
                <input type="text" required value={secTitle} onChange={e => setSecTitle(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary">Lưu</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Lesson */}
      {showLessonModal && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <div className="modal-header">
              <h2>Thêm Bài Học</h2>
              <button onClick={() => setShowLessonModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleAddLesson} className="modal-body">
              <div className="form-group">
                <label>Tên bài học</label>
                <input type="text" required value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label><input type="checkbox" checked={isFreePreview} onChange={e => setIsFreePreview(e.target.checked)} /> Cho phép học thử miễn phí</label>
              </div>
              <button type="submit" className="btn-primary">Lưu</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <div className="modal-header">
              <h2>Upload Tài Liệu</h2>
              <button onClick={() => setShowUploadModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleUpload} className="modal-body">
              <div className="form-group">
                <label>Chọn file (PDF, DOCX, ZIP - Max 10MB)</label>
                <input type="file" required onChange={e => setFile(e.target.files[0])} />
              </div>
              <button type="submit" className="btn-primary">Tải lên</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assignment */}
      {showAssignmentModal && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <div className="modal-header">
              <h2>Tạo Bài Tập</h2>
              <button onClick={() => setShowAssignmentModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="modal-body">
              <div className="form-group">
                <label>Loại bài tập</label>
                <select value={assignmentData.type} onChange={e => setAssignmentData({...assignmentData, type: e.target.value})}>
                  <option value="essay">Tự luận (Essay)</option>
                  <option value="quiz">Trắc nghiệm (Quiz) - Đang phát triển</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề</label>
                <input type="text" required value={assignmentData.title} onChange={e => setAssignmentData({...assignmentData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mô tả (Đề bài)</label>
                <textarea rows="4" required value={assignmentData.description} onChange={e => setAssignmentData({...assignmentData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn-primary">Tạo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
