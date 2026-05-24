import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTeacherCourses } from "../../api/teacherApi";
import {
  COL_LABELS,
  addDays,
  formatDayDM,
  formatSessionTime,
  startOfWeekMonday,
  jsDayToCol
} from "../../utils/courseSchedule";
import "../SchedulePage.css";
import "./TeacherSchedule.css";

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isSameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TeacherSchedulePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("week");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchTeacherCourses()
      .then((res) => {
        if (res.success) setCourses(res.courses || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const coursesWithSessions = useMemo(
    () => courses.filter((c) => Array.isArray(c.sessions) && c.sessions.length > 0),
    [courses]
  );

  const weekData = useMemo(() => {
    const base = new Date();
    const mon = startOfWeekMonday(base);
    mon.setDate(mon.getDate() + offset * 7);
    const sun = addDays(mon, 6);
    const y = mon.getFullYear();
    const label = `Tuần ${formatDayDM(mon)} - ${formatDayDM(sun)}, ${y}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cols = [];
    for (let col = 0; col < 7; col++) {
      const d = addDays(mon, col);
      d.setHours(0, 0, 0, 0);
      const isToday = d.getTime() === today.getTime();
      const name = COL_LABELS[col];
      const header = isToday ? `${name} - Hôm nay / ${formatDayDM(d)}` : `${name} / ${formatDayDM(d)}`;
      cols.push({ col, header, date: d });
    }
    return { label, columns: cols };
  }, [offset]);

  const monthData = useMemo(() => {
    const base = new Date();
    base.setMonth(base.getMonth() + offset);
    base.setDate(1);
    const month = base.getMonth();
    const year = base.getFullYear();
    const label = `Tháng ${month + 1}, ${year}`;

    const firstCol = jsDayToCol(base);
    const lastDay = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstCol; i++) {
      days.push({ empty: true, key: `empty-start-${i}` });
    }
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d);
      days.push({
        empty: false,
        date: d,
        col: jsDayToCol(date),
        key: `day-${d}`,
        isToday: isSameCalendarDay(date, new Date())
      });
    }
    const remainder = days.length % 7;
    if (remainder > 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        days.push({ empty: true, key: `empty-end-${i}` });
      }
    }
    return { label, days };
  }, [offset]);

  const sessionsByCol = useMemo(() => {
    const map = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const course of coursesWithSessions) {
      for (const s of course.sessions) {
        if (!map[s.col]) map[s.col] = [];
        map[s.col].push({
          id: course._id,
          title: course.title,
          category: course.categoryRef?.name || course.categoryId || "",
          timeStr: formatSessionTime(s)
        });
      }
    }
    for (const col of Object.keys(map)) {
      map[col].sort((a, b) => a.timeStr.localeCompare(b.timeStr, "vi"));
    }
    return map;
  }, [coursesWithSessions]);

  if (loading) {
    return (
      <div className="tz-ts-page">
        <div className="tz-ts-loading">Đang tải lịch giảng dạy...</div>
      </div>
    );
  }

  return (
    <div className="tz-ts-page">
      <header className="tz-ts-header">
        <div>
          <p className="tz-ts-kicker">LỊCH GIẢNG DẠY</p>
          <h1 className="tz-ts-title">Lịch các khóa học phụ trách</h1>
          <p className="tz-ts-desc">
            Xem lịch dạy theo tuần hoặc tháng của {courses.length} khóa học bạn đang quản lý.
          </p>
        </div>
      </header>

      {courses.length === 0 ? (
        <div className="tz-ts-empty">
          <p>Bạn chưa được phân công khóa học nào.</p>
          <Link to="/teacher/courses" className="tz-ts-link">Quản lý lớp học</Link>
        </div>
      ) : (
        <>
          <div className="schedule-page">
            <div className="schedule-page__header-actions">
              <div className="schedule-page__view-toggle">
                <button
                  type="button"
                  className={`tz-toggle-btn ${viewMode === "week" ? "active" : ""}`}
                  onClick={() => { setViewMode("week"); setOffset(0); }}
                >
                  Tuần
                </button>
                <button
                  type="button"
                  className={`tz-toggle-btn ${viewMode === "month" ? "active" : ""}`}
                  onClick={() => { setViewMode("month"); setOffset(0); }}
                >
                  Tháng
                </button>
              </div>
            </div>

            <div className="schedule-page__week-nav">
              <button type="button" className="schedule-page__week-btn" onClick={() => setOffset((o) => o - 1)}>
                <ChevronLeft />
              </button>
              <span className="schedule-page__week-label">
                {viewMode === "week" ? weekData.label : monthData.label}
              </span>
              <button type="button" className="schedule-page__week-btn" onClick={() => setOffset((o) => o + 1)}>
                <ChevronRight />
              </button>
            </div>

            {coursesWithSessions.length === 0 ? (
              <p className="schedule-page__empty">
                Các khóa học chưa có lịch dạy chi tiết theo buổi. Xem thông tin lịch bên dưới.
              </p>
            ) : viewMode === "week" ? (
              <div className="schedule-page__grid" role="grid" aria-label="Lịch giảng dạy theo tuần">
                {weekData.columns.map(({ col, header }) => (
                  <div key={col} className="schedule-page__col" role="columnheader">
                    <div className="schedule-page__col-head">{header}</div>
                    <div className="schedule-page__col-body">
                      {(sessionsByCol[col] || []).map((item, i) => (
                        <div key={`${item.id}-${i}`} className="schedule-page__slot tz-ts-slot">
                          <div className="schedule-page__slot-title">{item.title}</div>
                          {item.category ? <div className="tz-ts-slot-cat">{item.category}</div> : null}
                          <div className="schedule-page__slot-time">{item.timeStr}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="schedule-page__month-grid">
                <div className="schedule-page__month-header">
                  {COL_LABELS.map((name) => (
                    <div key={name} className="schedule-page__month-header-cell">{name}</div>
                  ))}
                </div>
                <div className="schedule-page__month-body">
                  {monthData.days.map((day) => (
                    <div
                      key={day.key}
                      className={`schedule-page__month-cell ${day.empty ? "empty" : ""} ${day.isToday ? "today" : ""}`}
                    >
                      {!day.empty && (
                        <>
                          <div className="schedule-page__month-date">{day.date}</div>
                          <div className="schedule-page__month-sessions">
                            {(sessionsByCol[day.col] || []).map((item, i) => (
                              <div key={`${item.id}-${i}`} className="schedule-page__month-slot tz-ts-month-slot">
                                <span className="time">{item.timeStr}</span>
                                <span className="title">{item.title}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <section className="tz-ts-course-list">
            <h2>Chi tiết lịch từng khóa học</h2>
            <div className="tz-ts-course-grid">
              {courses.map((course) => (
                <div key={course._id} className="tz-ts-course-card">
                  <div className="tz-ts-course-card-head">
                    <span className="tz-ts-course-badge">
                      {course.categoryRef?.name || course.categoryId || "Khóa học"}
                    </span>
                    <Link to={`/teacher/courses/${course._id}/lessons`} className="tz-ts-course-link">
                      Soạn giáo trình →
                    </Link>
                  </div>
                  <h3>{course.title}</h3>
                  <ul className="tz-ts-course-meta">
                    <li><strong>Lịch học:</strong> {course.schedule || "Chưa cập nhật"}</li>
                    <li><strong>Khai giảng:</strong> {course.startDate || "Chưa cập nhật"}</li>
                    {course.totalSessions ? (
                      <li><strong>Số buổi:</strong> {course.totalSessions} buổi ({course.sessionDuration || 90} phút/buổi)</li>
                    ) : null}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
