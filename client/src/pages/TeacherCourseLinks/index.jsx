import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { putCourseSessionLink } from "../../api/courseLinks";
import { getAuth } from "../../auth/auth";
import { canUseTeacherCourseLinkTools } from "../../auth/teacherApproval";
import { useCourses } from "../../context/CoursesContext";
import { COL_LABELS } from "../../utils/courseSchedule";
import "./TeacherCourseLinks.css";

export default function TeacherCourseLinksPage() {
  const auth = getAuth();
  const { courses } = useCourses();
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (!courses.length) return;
    if (!courseId || !courses.some((c) => c.id === courseId)) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);
  const [weekdayCol, setWeekdayCol] = useState(1);
  const [meetUrl, setMeetUrl] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  const allowed = canUseTeacherCourseLinkTools(auth);
  if (!allowed) {
    if (auth.accountType === "teacher" && auth.role !== "admin") {
      return (
        <div className="tcl">
          <h1 className="tcl__title">Gửi link buổi học trực tuyến</h1>
          <p className="tcl__lead">
            Tài khoản giáo viên của bạn <strong>đang chờ quản trị viên phê duyệt</strong>. Sau khi được duyệt, bạn có thể
            cập nhật link buổi học tại đây. Nếu cần hỗ trợ, vui lòng liên hệ ban quản trị.
          </p>
          <Link className="tcl__back" to="/dashboard">
            ← Về Tổng quan
          </Link>
        </div>
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!courseId || !meetUrl.trim()) {
      setErr("Chọn khóa và nhập link (Google Meet, Zoom, …).");
      return;
    }
    if (!password) {
      setErr("Nhập mật khẩu để xác nhận (tài khoản đăng ký bằng email).");
      return;
    }
    setSaving(true);
    try {
      await putCourseSessionLink({
        courseId,
        email: auth.email,
        password,
        weekdayCol: Number(weekdayCol),
        meetUrl: meetUrl.trim()
      });
      setMsg("Đã lưu link. Học viên sẽ thấy khi đến đúng ngày và giờ buổi học.");
      setPassword("");
    } catch (e2) {
      setErr(e2.message || "Không lưu được.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tcl">
      <h1 className="tcl__title">Gửi link buổi học trực tuyến</h1>
      <p className="tcl__lead">
        Chọn khóa và <strong>thứ trong tuần</strong> tương ứng buổi học (khớp lịch cố định của khóa). Học viên chỉ thấy nút
        link trong đúng khung giờ đó.
      </p>
      <p className="tcl__note">
        Yêu cầu tài khoản <strong>email + mật khẩu</strong> đã đăng ký với vai trò <strong>giáo viên</strong> (hoặc quản trị
        viên). Đăng nhập Google chưa hỗ trợ lưu link qua API này.
      </p>

      <form className="tcl__form" onSubmit={handleSubmit}>
        <label className="tcl__field">
          <span>Khóa học</span>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <label className="tcl__field">
          <span>Thứ (cột lịch)</span>
          <select value={weekdayCol} onChange={(e) => setWeekdayCol(Number(e.target.value))}>
            {COL_LABELS.map((label, col) => (
              <option key={label} value={col}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="tcl__field">
          <span>Link lớp (https://…)</span>
          <input
            type="url"
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            autoComplete="off"
          />
        </label>

        <label className="tcl__field">
          <span>Mật khẩu xác nhận</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu đăng nhập TZone"
            autoComplete="current-password"
          />
        </label>

        {err ? (
          <p className="tcl__err" role="alert">
            {err}
          </p>
        ) : null}
        {msg ? (
          <p className="tcl__ok" role="status">
            {msg}
          </p>
        ) : null}

        <button type="submit" className="tcl__submit" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu link"}
        </button>
      </form>

      <Link className="tcl__back" to="/dashboard">
        ← Về Tổng quan
      </Link>
    </div>
  );
}
