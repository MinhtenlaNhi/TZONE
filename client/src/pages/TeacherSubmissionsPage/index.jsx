import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAssignmentSubmissions, gradeSubmission } from "../../api/teacherApi";
import { toast } from "react-toastify";

export default function TeacherSubmissionsPage() {
  const { lessonId } = useParams(); // URL là /teacher/lessons/:lessonId/submissions. (Có thể bạn để ID của assignment, ở đây tạm gọi là lessonId trên route, nhưng thực tế là assignmentId)
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, [lessonId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      // Giả sử URL được gọi bằng assignment ID
      const res = await fetchAssignmentSubmissions(lessonId);
      if (res.success) {
        setSubmissions(res.submissions);
      }
    } catch (e) {
      toast.error("Lỗi lấy danh sách bài nộp");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      const res = await gradeSubmission(activeSub._id, score, comment);
      if (res.success) {
        toast.success("Chấm điểm thành công");
        setShowGradeModal(false);
        loadSubmissions();
      }
    } catch {
      toast.error("Lỗi chấm điểm");
    }
  };

  return (
    <div className="teacher-page container">
      <header className="teacher-header">
        <h1>Bài nộp của học viên</h1>
      </header>

      {loading ? <p>Đang tải...</p> : (
        <div className="curriculum-builder">
          {submissions.length === 0 ? <p>Chưa có học sinh nào nộp bài.</p> : (
            <table className="t-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Loại</th>
                  <th>File / Nội dung</th>
                  <th>Ngày nộp</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub._id}>
                    <td>
                      <div><strong>{sub.studentRef?.name}</strong></div>
                      <div style={{fontSize: '0.85rem', color: '#64748b'}}>{sub.studentRef?.email}</div>
                    </td>
                    <td>{sub.type === "essay" ? "Tự luận" : "Trắc nghiệm"}</td>
                    <td>
                      {sub.type === "essay" ? (
                        <>
                          {sub.fileUrl && <a href={`${import.meta.env.VITE_API_URL || ""}${sub.fileUrl}`} target="_blank" rel="noreferrer">Tải file</a>}
                          {sub.textContent && <p style={{margin: '0.5rem 0 0 0', fontStyle: 'italic'}}>"{sub.textContent.slice(0, 50)}..."</p>}
                        </>
                      ) : (
                        <span>Tự động chấm</span>
                      )}
                    </td>
                    <td>{new Date(sub.createdAt).toLocaleString("vi-VN")}</td>
                    <td>
                      {sub.status === "graded" ? <span className="badge-paid">Đã chấm ({sub.score}/100)</span> : <span className="badge-trial">Chờ chấm</span>}
                    </td>
                    <td>
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => { setActiveSub(sub); setScore(sub.score || 0); setComment(sub.teacherComment || ""); setShowGradeModal(true); }}
                      >
                        Chấm Điểm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <div className="modal-header">
              <h2>Chấm bài: {activeSub?.studentRef?.name}</h2>
              <button onClick={() => setShowGradeModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              {activeSub?.type === "essay" && (
                <div style={{marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '6px'}}>
                  <p><strong>Nội dung nộp:</strong></p>
                  <p>{activeSub.textContent || "(Không có văn bản)"}</p>
                </div>
              )}
              <form onSubmit={handleGrade}>
                <div className="form-group">
                  <label>Điểm (0-100)</label>
                  <input type="number" min="0" max="100" required value={score} onChange={e => setScore(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Nhận xét</label>
                  <textarea rows="4" value={comment} onChange={e => setComment(e.target.value)}></textarea>
                </div>
                <button type="submit" className="btn-primary">Lưu Điểm</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
