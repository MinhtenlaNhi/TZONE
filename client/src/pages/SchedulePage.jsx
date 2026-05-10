import { useEffect, useMemo, useState } from "react";
import { useCourses } from "../context/CoursesContext";
import { initDemoEnrollmentOnce, getOngoingCourseIds } from "../auth/enrolledCoursesStorage";
import { COL_LABELS, addDays, formatDayDM, formatSessionTime, startOfWeekMonday } from "../utils/courseSchedule";
import "./SchedulePage.css";

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

export default function SchedulePage() {
  const { getCoursesByIds } = useCourses();
  const [weekOffset, setWeekOffset] = useState(0);
  const [enrolledVersion, setEnrolledVersion] = useState(0);

  useEffect(() => {
    initDemoEnrollmentOnce();
    setEnrolledVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    function onCoursesChanged() {
      setEnrolledVersion((v) => v + 1);
    }
    window.addEventListener("tzone-courses-changed", onCoursesChanged);
    return () => window.removeEventListener("tzone-courses-changed", onCoursesChanged);
  }, []);

  const enrolledCourses = useMemo(
    () => getCoursesByIds(getOngoingCourseIds()),
    [enrolledVersion, getCoursesByIds]
  );

  const { weekLabel, columns } = useMemo(() => {
    const base = new Date();
    const mon = startOfWeekMonday(base);
    mon.setDate(mon.getDate() + weekOffset * 7);
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
    return { monday: mon, weekLabel: label, columns: cols };
  }, [weekOffset]);

  /** Các buổi học hiển thị trong cột col */
  const sessionsByCol = useMemo(() => {
    /** @type {Record<number, { title: string, timeStr: string }[]>} */
    const map = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const course of enrolledCourses) {
      for (const s of course.sessions || []) {
        if (!map[s.col]) map[s.col] = [];
        map[s.col].push({
          title: course.title,
          timeStr: formatSessionTime(s)
        });
      }
    }
    return map;
  }, [enrolledCourses]);

  return (
    <div className="schedule-page">
      <h1 className="schedule-page__title visually-hidden">Lịch học</h1>

      <div className="schedule-page__week-nav">
        <button
          type="button"
          className="schedule-page__week-btn"
          aria-label="Tuần trước"
          onClick={() => setWeekOffset((w) => w - 1)}
        >
          <ChevronLeft />
        </button>
        <span className="schedule-page__week-label">{weekLabel}</span>
        <button
          type="button"
          className="schedule-page__week-btn"
          aria-label="Tuần sau"
          onClick={() => setWeekOffset((w) => w + 1)}
        >
          <ChevronRight />
        </button>
      </div>

      {enrolledCourses.length === 0 ? (
        <p className="schedule-page__empty">
          Bạn không có khóa nào đang học. Đăng ký khóa ở Tổng quan hoặc xem mục Các khóa học của bạn.
        </p>
      ) : (
        <div className="schedule-page__grid" role="grid" aria-label="Lịch học theo tuần">
          {columns.map(({ col, header }) => (
            <div key={col} className="schedule-page__col" role="columnheader">
              <div className="schedule-page__col-head">{header}</div>
              <div className="schedule-page__col-body">
                {(sessionsByCol[col] || []).map((item, i) => (
                  <div key={`${item.title}-${i}`} className="schedule-page__slot">
                    <div className="schedule-page__slot-title">{item.title}</div>
                    <div className="schedule-page__slot-time">{item.timeStr}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
