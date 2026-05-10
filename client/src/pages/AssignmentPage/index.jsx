import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAssignmentDetail, submitAssignment, fetchMySubmission } from "../../api/assignmentsApi";
import "./AssignmentPage.css";

export default function AssignmentPage() {
  const { courseId, id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // States cho Quiz
  const [answers, setAnswers] = useState([]); // mảng index của đáp án chọn
  
  // States cho Essay
  const [textContent, setTextContent] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resA = await fetchAssignmentDetail(id);
        if (resA.success) {
          setAssignment(resA.assignment);
          if (resA.assignment.type === 'quiz') {
            setAnswers(new Array(resA.assignment.questions.length).fill(null));
          }
        } else {
          toast.error(resA.message || "Lỗi tải bài tập");
          setLoading(false);
          return;
        }

        const resS = await fetchMySubmission(id);
        if (resS.success && resS.submission) {
          setSubmission(resS.submission);
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleQuizChange = (qIndex, optIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    if (answers.includes(null)) {
      if (!window.confirm("Bạn chưa trả lời hết các câu hỏi. Bạn có chắc muốn nộp bài?")) {
        return;
      }
    }
    try {
      setSubmitting(true);
      const res = await submitAssignment(id, { answers }, false);
      if (res.success) {
        toast.success("Đã nộp bài!");
        setSubmission(res.submission);
        // Tải lại assignment để lấy được correctAnswerIndex
        const resA = await fetchAssignmentDetail(id);
        if (resA.success) setAssignment(resA.assignment);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEssaySubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    
    if (!textContent.trim() && !file) {
      toast.error("Vui lòng nhập nội dung hoặc tải lên một tệp.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("textContent", textContent);
      if (file) formData.append("file", file);

      const res = await submitAssignment(id, formData, true);
      if (res.success) {
        toast.success("Nộp bài tự luận thành công!");
        setSubmission(res.submission);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="assignment-loading">Đang tải bài tập...</div>;
  if (!assignment) return <div className="assignment-loading">Không tìm thấy bài tập.</div>;

  const renderQuizMode = () => {
    const isDone = !!submission;

    return (
      <div className="quiz-container">
        {isDone && (
          <div className="quiz-result-card">
            <h2>Kết quả của bạn: <span className="score-text">{submission.score} / 100</span></h2>
            <p className="text-gray">Xem lại đáp án chi tiết bên dưới.</p>
          </div>
        )}

        <div className="quiz-questions">
          {assignment.questions.map((q, qIndex) => {
            const userChoice = isDone ? submission.answers[qIndex] : answers[qIndex];
            const isCorrect = isDone && userChoice === q.correctAnswerIndex;
            const isWrong = isDone && userChoice !== q.correctAnswerIndex;

            return (
              <div key={qIndex} className={`question-card ${isDone ? (isCorrect ? 'correct-box' : 'wrong-box') : ''}`}>
                <h4 className="question-text">Câu {qIndex + 1}: {q.questionText}</h4>
                <div className="options-list">
                  {q.options.map((opt, optIndex) => {
                    let optClass = "option-item";
                    if (isDone) {
                      if (optIndex === q.correctAnswerIndex) optClass += " correct-opt";
                      else if (optIndex === userChoice && isWrong) optClass += " wrong-opt";
                      optClass += " disabled";
                    }

                    return (
                      <label key={optIndex} className={optClass}>
                        <input 
                          type="radio" 
                          name={`q-${qIndex}`} 
                          value={optIndex}
                          checked={userChoice === optIndex}
                          onChange={() => handleQuizChange(qIndex, optIndex)}
                          disabled={isDone}
                        />
                        <span className="option-text">{opt}</span>
                      </label>
                    );
                  })}
                </div>
                {isDone && q.explanation && (
                  <div className="explanation-box">
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isDone && (
          <div className="quiz-actions">
            <button className="btn-submit-assignment" onClick={handleQuizSubmit} disabled={submitting}>
              {submitting ? "Đang nộp..." : "Nộp bài trắc nghiệm"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEssayMode = () => {
    const isDone = !!submission;

    if (isDone) {
      return (
        <div className="essay-result-container">
          <div className="status-banner">
            <h3>Trạng thái: {submission.status === 'graded' ? 'Đã chấm điểm' : 'Đang chờ chấm'}</h3>
            {submission.status === 'graded' && (
              <div className="graded-info">
                <p className="final-score">Điểm: {submission.score} / 100</p>
                {submission.teacherComment && (
                  <div className="teacher-comment">
                    <strong>Nhận xét của GV:</strong>
                    <p>{submission.teacherComment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="your-submission">
            <h4>Bài nộp của bạn:</h4>
            {submission.textContent && (
              <div className="submission-text">{submission.textContent}</div>
            )}
            {submission.fileUrl && (
              <div className="submission-file">
                <a href={`${import.meta.env.VITE_API_URL || ""}${submission.fileUrl}`} target="_blank" rel="noreferrer">
                  📎 Tải file đính kèm đã nộp
                </a>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <form className="essay-form" onSubmit={handleEssaySubmit}>
        <div className="essay-instruction">
          <div dangerouslySetInnerHTML={{ __html: assignment.essayDescription }} />
        </div>
        
        <div className="form-group">
          <label>Nhập nội dung trả lời:</label>
          <textarea 
            rows="8" 
            placeholder="Gõ câu trả lời của bạn ở đây..." 
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Hoặc nộp file đính kèm (Word/Ảnh/PDF):</label>
          <input type="file" ref={fileInputRef} />
        </div>

        <button type="submit" className="btn-submit-assignment" disabled={submitting}>
          {submitting ? "Đang nộp..." : "Nộp bài tự luận"}
        </button>
      </form>
    );
  };

  return (
    <div className="assignment-page">
      <div className="assignment-header">
        <Link to={`/learn/${courseId}`} className="back-link">← Quay lại Bài học</Link>
        <h1>{assignment.title}</h1>
        <div className="assignment-meta">
          <span className={`badge ${assignment.type === 'quiz' ? 'badge-quiz' : 'badge-essay'}`}>
            {assignment.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
          </span>
          {assignment.dueDate && (
            <span className="due-date">Hạn nộp: {new Date(assignment.dueDate).toLocaleString('vi-VN')}</span>
          )}
        </div>
      </div>

      <div className="assignment-body">
        {assignment.type === "quiz" ? renderQuizMode() : renderEssayMode()}
      </div>
    </div>
  );
}
