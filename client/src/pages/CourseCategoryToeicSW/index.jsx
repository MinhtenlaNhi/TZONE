import { useState } from "react";
import CoursePageHeader from "../../components/CoursePageHeader";
import "../CourseCategoryTapSu/styles.css";

function IconDoc() {
  return (
    <svg className="tap-su-accordion__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="tap-su-card__clock" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const speakingItems = [
  {
    id: "sp1",
    title: "Buổi 1 – Buổi 5: Module 01+02",
    bullets: [
      "Đọc văn bản dạng Announcement – Guide – Intro (công viên, đường phố, bãi biển, cửa hàng, nhà hàng).",
      "Đọc văn bản dạng News – Automated message – Advertisement (văn phòng, lớp học, sân bay).",
      "Luyện đọc tổng hợp (thư viện, phòng lab, …).",
      "Miêu tả vật thể và các dạng tranh khó."
    ]
  },
  { id: "sp2", title: "Buổi 6 – 10: Module 03", detail: null },
  { id: "sp3", title: "Buổi 11 – 15: Module 05", detail: null },
  { id: "sp4", title: "Buổi 15 – 16: Module 04", detail: null },
  { id: "sp5", title: "Buổi 17 – 18: Full test", detail: null }
];

const writingItems = [
  {
    id: "w1",
    title: "Buổi 1",
    bullets: [
      "Phân biệt các phần ngữ pháp dễ nhầm lẫn.",
      "Làm quen miêu tả tranh và luyện tập."
    ]
  },
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
    id: `w${n}`,
    title: `Buổi ${n}`,
    detail: null
  }))
];

function SyllabusAccordion({ items, openId, onToggle }) {
  return (
    <div className="tap-su-accordion">
      {items.map((item) => {
        const expanded = openId === item.id;
        return (
          <div key={item.id} className="tap-su-accordion__item">
            <button
              type="button"
              className="tap-su-accordion__trigger"
              aria-expanded={expanded}
              onClick={() => onToggle(expanded ? "" : item.id)}
            >
              <span className="tap-su-accordion__left">
                <IconDoc />
                <span>{item.title}</span>
              </span>
              <span className="tap-su-accordion__chev" aria-hidden>
                ▼
              </span>
            </button>
            {expanded ? (
              <div className="tap-su-accordion__panel tap-su-accordion__panel--compact">
                {item.bullets ? (
                  <ul className="tap-su-accordion__bullets">
                    {item.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : item.detail ? (
                  item.detail
                ) : (
                  <span className="tap-su-accordion__placeholder">
                    Chi tiết theo giáo trình từng buổi học.
                  </span>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function CourseCategoryToeicSWPage({ embedded = false }) {
  const [openSpeaking, setOpenSpeaking] = useState("sp1");
  const [openWriting, setOpenWriting] = useState("w1");

  return (
    <div className={embedded ? "tap-su-page tap-su-page--embedded" : "tap-su-page"}>
      {!embedded && <CoursePageHeader />}

      <main className="tap-su-page__main">
        <h2 className="tap-su-page__hero-title tap-su-page__hero-title--long">
          LỚP TOEIC SPEAKING + WRITING
        </h2>

        <div className="tap-su-overview">
          <article className="tap-su-card">
            <p className="tap-su-card__lead">
              Dành cho học viên đã hoàn thành phần <strong>TOEIC Listening &amp; Reading</strong> và
              muốn nâng cao <strong>Speaking &amp; Writing</strong> phục vụ môi trường công việc
              chuyên nghiệp.
            </p>
            <p className="tap-su-card__text">
              Phù hợp học viên đã xong <strong>TOEIC A</strong> hoặc <strong>TOEIC B</strong>, hoặc
              có điểm TOEIC L&amp;R khoảng <strong>600–650+</strong>.
            </p>
            <p className="tap-su-card__text" style={{ marginTop: 12 }}>
              Mục tiêu tổng điểm TOEIC S+W đạt <strong>400</strong>, cam kết tối thiểu{" "}
              <strong>240+</strong>.
            </p>
          </article>

          <article className="tap-su-card">
            <p className="tap-su-card__duration-label">Thời lượng</p>
            <p className="tap-su-card__stat tap-su-card__stat--block">27 buổi</p>
            <ul className="tap-su-card__list">
              <li>18 buổi học Speaking</li>
              <li>10 buổi học Writing</li>
            </ul>
          </article>

          <article className="tap-su-card">
            <div className="tap-su-card__schedule-head">
              <IconClock />
              <div>
                <p className="tap-su-card__stat" style={{ marginBottom: 4 }}>
                  3 buổi / tuần
                </p>
                <p className="tap-su-card__text">2 giờ / buổi học</p>
              </div>
            </div>
            <p className="tap-su-card__sub" style={{ marginTop: 12 }}>
              <strong>10 – 14 học viên</strong> / lớp.
            </p>
          </article>
        </div>

        <section className="tap-su-syllabus tap-su-syllabus--dual" aria-label="Nội dung khóa học">
          <div className="tap-su-syllabus__col">
            <h3 className="tap-su-syllabus__col-title">18 buổi học Speaking</h3>
            <SyllabusAccordion
              items={speakingItems}
              openId={openSpeaking}
              onToggle={setOpenSpeaking}
            />
          </div>
          <div className="tap-su-syllabus__col">
            <h3 className="tap-su-syllabus__col-title">10 buổi học Writing</h3>
            <SyllabusAccordion items={writingItems} openId={openWriting} onToggle={setOpenWriting} />
          </div>
        </section>
      </main>
    </div>
  );
}
