import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPublicInstructors } from "../../api/instructors";
import {
  approveTeacher,
  fetchAllTeachers,
  fetchPendingTeachers,
  rejectTeacher
} from "../../api/adminTeachers";
import { createAdminCourse, fetchAdminCoursesList } from "../../api/adminCoursesApi";
import { clearAuth, getAuth } from "../../auth/auth";
import { COURSE_CATEGORIES } from "../../data/studentCourses";
import { COL_LABELS } from "../../utils/courseSchedule";
import "./styles.css";

function statusLabel(status) {
  const s = status || "approved";
  if (s === "pending") return "Chờ duyệt";
  if (s === "rejected") return "Từ chối";
  return "Đã duyệt";
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

export default function AdminTeachersPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [adminPassword, setAdminPassword] = useState("");
  const [pending, setPending] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [actionEmail, setActionEmail] = useState(null);
  const [listErr, setListErr] = useState(null);
  const [pendingFetchDone, setPendingFetchDone] = useState(false);

  const [dbCourses, setDbCourses] = useState([]);
  const [loadingDbCourses, setLoadingDbCourses] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseErr, setCourseErr] = useState(null);
  const [courseOk, setCourseOk] = useState(null);
  const [newCategoryId, setNewCategoryId] = useState("toeic-a");
  const [newTitle, setNewTitle] = useState("");
  const [newSchedule, setNewSchedule] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEnrolled, setNewEnrolled] = useState("0");
  const [newCapacity, setNewCapacity] = useState("30");
  const [newRating, setNewRating] = useState("4.5");
  const [newRatingLabel, setNewRatingLabel] = useState("—");
  const [newCustomId, setNewCustomId] = useState("");
  const [newStartTime, setNewStartTime] = useState("18:00");
  const [newEndTime, setNewEndTime] = useState("19:30");
  const [newSessionCols, setNewSessionCols] = useState(() => new Set([0, 2, 4]));

  const [publicInstructors, setPublicInstructors] = useState([]);
  const [loadingPublicInstructors, setLoadingPublicInstructors] = useState(true);

  const adminEmail = auth?.email || "";

  useEffect(() => {
    let cancelled = false;
    setLoadingPublicInstructors(true);
    fetchPublicInstructors()
      .then((d) => {
        if (!cancelled) setPublicInstructors(d.instructors || []);
      })
      .catch(() => {
        if (!cancelled) setPublicInstructors([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPublicInstructors(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSessionCol(col) {
    setNewSessionCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }

  const loadDbCourses = useCallback(async () => {
    if (!adminEmail) {
      setCourseErr("Không có email đăng nhập.");
      return;
    }
    if (!adminPassword.trim()) {
      setCourseErr("Nhập mật khẩu quản trị (cùng ô phía trên).");
      return;
    }
    const c = { adminEmail, adminPassword };
    setLoadingDbCourses(true);
    setCourseErr(null);
    setCourseOk(null);
    try {
      const d = await fetchAdminCoursesList(c);
      setDbCourses(d.courses || []);
    } catch (e) {
      setCourseErr(e.message || "Không tải được danh sách khóa học.");
    } finally {
      setLoadingDbCourses(false);
    }
  }, [adminEmail, adminPassword]);

  const refreshPublicInstructors = useCallback(async () => {
    setLoadingPublicInstructors(true);
    try {
      const d = await fetchPublicInstructors();
      setPublicInstructors(d.instructors || []);
    } catch {
      setPublicInstructors([]);
    } finally {
      setLoadingPublicInstructors(false);
    }
  }, []);

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!adminEmail) {
      setCourseErr("Không có email đăng nhập.");
      return;
    }
    if (!adminPassword.trim()) {
      setCourseErr("Nhập mật khẩu quản trị (cùng ô phía trên).");
      return;
    }
    const c = { adminEmail, adminPassword };
    const titleTrim = newTitle.trim();
    if (!titleTrim) {
      setCourseErr("Nhập tên khóa học.");
      return;
    }
    const sessionCols = [...newSessionCols].sort((a, b) => a - b);
    if (sessionCols.length === 0) {
      setCourseErr("Chọn ít nhất một thứ trong tuần cho lịch học.");
      return;
    }
    setCourseErr(null);
    setCourseOk(null);
    setCreatingCourse(true);
    try {
      const course = {
        categoryId: newCategoryId,
        title: titleTrim,
        schedule: newSchedule.trim(),
        instructor: newInstructor.trim(),
        price: newPrice.trim(),
        startDate: newStartDate.trim(),
        enrolled: newEnrolled.trim() || "0",
        capacity: newCapacity.trim() || "30",
        rating: Number(newRating) || 4.5,
        ratingLabel: newRatingLabel.trim() || "—",
        sessionCols,
        startTime: newStartTime,
        endTime: newEndTime
      };
      const idTrim = newCustomId.trim();
      if (idTrim) course.id = idTrim;
      await createAdminCourse({ ...c, course });
      setCourseOk("Đã tạo khóa học mới. Học viên sẽ thấy trên Tổng quan sau khi tải lại trang.");
      window.dispatchEvent(new Event("tzone-courses-changed"));
      await loadDbCourses();
    } catch (err2) {
      setCourseErr(err2.message || "Không tạo được khóa học.");
    } finally {
      setCreatingCourse(false);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  const requireCreds = useCallback(() => {
    if (!adminEmail) {
      setListErr("Không có email đăng nhập.");
      return null;
    }
    if (!adminPassword.trim()) {
      setListErr("Nhập mật khẩu quản trị để gọi API.");
      return null;
    }
    setListErr(null);
    return { adminEmail, adminPassword };
  }, [adminEmail, adminPassword]);

  const loadPending = useCallback(async () => {
    const c = requireCreds();
    if (!c) return;
    setLoadingPending(true);
    try {
      const data = await fetchPendingTeachers(c);
      setPending(data.teachers || []);
      setListErr(null);
      setPendingFetchDone(true);
    } catch (e) {
      setListErr(e.message || "Không tải được danh sách.");
      setPendingFetchDone(false);
    } finally {
      setLoadingPending(false);
    }
  }, [requireCreds]);

  const loadAll = useCallback(async () => {
    const c = requireCreds();
    if (!c) return;
    setLoadingAll(true);
    try {
      const data = await fetchAllTeachers(c);
      setAllTeachers(data.teachers || []);
    } catch (e) {
      setListErr(e.message || "Không tải được danh sách.");
    } finally {
      setLoadingAll(false);
    }
  }, [requireCreds]);

  async function handleApprove(teacherEmail) {
    const c = requireCreds();
    if (!c) return;
    setActionEmail(teacherEmail);
    try {
      await approveTeacher({ ...c, teacherEmail });
      await loadPending();
      await loadAll();
      await refreshPublicInstructors();
    } catch (e) {
      setListErr(e.message || "Duyệt thất bại.");
    } finally {
      setActionEmail(null);
    }
  }

  async function handleReject(teacherEmail) {
    if (!window.confirm(`Từ chối tài khoản ${teacherEmail}? Giáo viên sẽ không đăng nhập được.`)) {
      return;
    }
    const c = requireCreds();
    if (!c) return;
    setActionEmail(teacherEmail);
    try {
      await rejectTeacher({ ...c, teacherEmail });
      await loadPending();
      await loadAll();
      await refreshPublicInstructors();
    } catch (e) {
      setListErr(e.message || "Từ chối thất bại.");
    } finally {
      setActionEmail(null);
    }
  }

  return (
    <div className="admin-page">
      <main className="admin-page__main admin-page__main--wide">

        <section className="admin-card admin-card--teachers" aria-labelledby="admin-teachers-heading">
          <div className="admin-card__head">
            <span className="admin-card__pill">Giáo viên</span>
            <h2 id="admin-teachers-heading" className="admin-card__title">
              Phê duyệt tài khoản giáo viên
            </h2>
          </div>
          <p className="admin-card__desc">
            Nhập <strong>mật khẩu đăng ký email</strong> của tài khoản quản trị (trong{" "}
            <code className="admin-code">EmailRegistration</code>), hoặc nếu server có cấu hình{" "}
            <code className="admin-code">ADMIN_API_SECRET</code> thì nhập đúng chuỗi đó (phù hợp khi bạn chỉ đăng nhập bằng
            Google). Giáo viên đăng ký bằng email sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi bạn duyệt.
          </p>

          <label className="admin-field">
            <span className="admin-field__label">
              Mật khẩu tài khoản email hoặc ADMIN_API_SECRET (chỉ dùng trong phiên này)
            </span>
            <input
              type="password"
              className="admin-field__input"
              autoComplete="current-password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {listErr ? (
            <p className="admin-page__err" role="alert">
              {listErr}
            </p>
          ) : null}

          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn--primary" disabled={loadingPending} onClick={loadPending}>
              {loadingPending ? "Đang tải…" : "Tải danh sách chờ duyệt"}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" disabled={loadingAll} onClick={loadAll}>
              {loadingAll ? "Đang tải…" : "Tải tất cả giáo viên"}
            </button>
          </div>

          {pendingFetchDone && pending.length === 0 ? (
            <p className="admin-page__info" role="status">
              Hiện <strong>không có</strong> tài khoản giáo viên nào đang chờ duyệt. Nếu bạn vừa cho giáo viên đăng ký: kiểm tra
              họ đăng ký bằng <strong>email + mật khẩu</strong> (vai trò giáo viên), và server đang trỏ đúng{" "}
              <strong>MongoDB</strong> có dữ liệu đó. Bấm <strong>Tải tất cả giáo viên</strong> để xem mọi bản ghi giáo viên
              trong CSDL.
            </p>
          ) : null}

          {pending.length > 0 ? (
            <div className="admin-table-wrap">
              <h3 className="admin-subtitle">Chờ duyệt ({pending.length})</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Tên</th>
                    <th>Đăng ký</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pending.map((t) => (
                    <tr key={t.email}>
                      <td>{t.email}</td>
                      <td>{t.name || "—"}</td>
                      <td>{formatDate(t.createdAt)}</td>
                      <td className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--primary"
                          disabled={actionEmail === t.email}
                          onClick={() => handleApprove(t.email)}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          disabled={actionEmail === t.email}
                          onClick={() => handleReject(t.email)}
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {allTeachers.length > 0 ? (
            <div className="admin-table-wrap">
              <h3 className="admin-subtitle">Tất cả giáo viên ({allTeachers.length})</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Tên</th>
                    <th>Mã GV</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {allTeachers.map((t) => {
                    const st = t.teacherApprovalStatus || "approved";
                    return (
                      <tr key={t.email}>
                        <td>{t.email}</td>
                        <td>{t.name || "—"}</td>
                        <td>
                          {t.teacherCode ? <code className="admin-code">{t.teacherCode}</code> : <span className="admin-muted">—</span>}
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge--${st}`}>{statusLabel(st)}</span>
                        </td>
                        <td>{formatDate(t.updatedAt)}</td>
                        <td className="admin-table__actions">
                          {st === "pending" ? (
                            <>
                              <button
                                type="button"
                                className="admin-btn admin-btn--sm admin-btn--primary"
                                disabled={actionEmail === t.email}
                                onClick={() => handleApprove(t.email)}
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--sm admin-btn--danger"
                                disabled={actionEmail === t.email}
                                onClick={() => handleReject(t.email)}
                              >
                                Từ chối
                              </button>
                            </>
                          ) : st === "rejected" ? (
                            <button
                              type="button"
                              className="admin-btn admin-btn--sm admin-btn--primary"
                              disabled={actionEmail === t.email}
                              onClick={() => handleApprove(t.email)}
                            >
                              Duyệt lại
                            </button>
                          ) : (
                            <span className="admin-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>



        <p className="admin-page__footer-hint">
          Sau khi duyệt, giáo viên có thể cần <strong>đăng nhập lại</strong> để giao diện cập nhật trạng thái.
        </p>
      </main>
    </div>
  );
}
