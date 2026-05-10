import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCourses } from "../context/CoursesContext";
import { COURSE_CATEGORIES, COURSE_IMG } from "../data/studentCourses";
import "./DashboardHome.css";

const AVATAR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face";

function IconCalendarSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconPeopleSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CourseCard({ course, imageIndex }) {
  const img = COURSE_IMG[imageIndex % COURSE_IMG.length];
  // Helper to extract clean category name for badge
  const catName = COURSE_CATEGORIES.find(c => c.id === course.categoryId)?.label || course.badge || "KHÓA HỌC";
  
  // Format rating count if it ends in 'k', remove it for mockup exact match, or just use it.
  const reviewCount = course.ratingLabel && course.ratingLabel.includes('k') 
    ? (parseFloat(course.ratingLabel) * 100).toFixed(0) 
    : (course.ratingLabel || "127");

  return (
    <div className="tz-catalog-card">
      <div className="tz-cc-cover">
        <img src={img} alt={course.title} className="tz-cc-img" loading="lazy" />
        <span className="tz-cc-badge">{catName}</span>
        <button className="tz-cc-favorite">
          <IconHeart />
        </button>
      </div>
      
      <div className="tz-cc-body">
        <div className="tz-cc-rating">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="tz-cc-score">{course.rating}</span>
          <span className="tz-cc-reviews">({reviewCount})</span>
        </div>
        
        <h3 className="tz-cc-title">{course.title}</h3>
        <p className="tz-cc-schedule">{course.schedule}</p>
        
        <div className="tz-cc-meta">
          <div className="tz-cc-meta-item">
            <IconCalendarSmall />
            <span>Ngày khai giảng {course.startDate}</span>
          </div>
          <div className="tz-cc-meta-item">
            <IconPeopleSmall />
            <span>{course.enrolled}/{course.capacity}</span>
          </div>
        </div>
        
        <div className="tz-cc-instructor">
          <img src={AVATAR_PLACEHOLDER} alt={course.instructor} className="tz-cc-avatar" />
          <span className="tz-cc-name">{course.instructor}</span>
        </div>
        
        <div className="tz-cc-footer">
          <span className="tz-cc-price">{course.price}</span>
          <Link to={`/courses/${course.id}`} className="tz-btn-link">
            Xem chi tiết <IconArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { courses } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get("category");
  const activeCategory = useMemo(() => {
    if (!categoryParam) return "all";
    return COURSE_CATEGORIES.some((c) => c.id === categoryParam) ? categoryParam : "all";
  }, [categoryParam]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return courses;
    return courses.filter((c) => c.categoryId === activeCategory);
  }, [activeCategory, courses]);

  // Extended categories for pill UI
  const pillCategories = [
    { id: "all", label: "Tất cả" },
    ...COURSE_CATEGORIES,
    { id: "luyen-thi", label: "Luyện thi" },
    { id: "ky-nang", label: "Kỹ năng" },
    { id: "khac", label: "Khác" }
  ];

  return (
    <div className="tz-dashboard-catalog">
      {/* Top Banner */}
      <div className="tz-dc-banner">
        <div className="tz-dc-banner-left">
          <div className="tz-dc-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="tz-dc-banner-text">
            <h2>Danh mục khóa học</h2>
            <p>Khám phá các khóa học chất lượng, phù hợp với mục tiêu của bạn</p>
          </div>
        </div>
        <div className="tz-dc-banner-right">
          <div className="tz-dc-stat">
            <span className="tz-dc-stat-num">128+</span>
            <span className="tz-dc-stat-label">Khóa học</span>
            <div className="tz-dc-stat-icon">
              <IconCalendarSmall />
            </div>
          </div>
          <button className="tz-btn-primary tz-btn-add">
            + Thêm khóa học
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="tz-dc-filter-bar">
        <div className="tz-dc-filter-left">
          <button className="tz-btn-outline tz-btn-filter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Danh mục
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          
          <div className="tz-dc-search">
            <input type="text" placeholder="Tìm kiếm khóa học..." />
            <IconSearch />
          </div>
        </div>
        
        <div className="tz-dc-sort">
          <span className="tz-dc-sort-label">Sắp xếp: Mới nhất</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Pills Categories */}
      <div className="tz-dc-pills">
        {pillCategories.map(cat => (
          <button
            key={cat.id}
            className={`tz-dc-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              if (cat.id === "all") searchParams.delete("category");
              else searchParams.set("category", cat.id);
              setSearchParams(searchParams);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="tz-dc-grid">
        {/* To make it look full like mockup, we map the courses multiple times if needed */}
        {[...filtered, ...filtered].slice(0, 12).map((c, idx) => (
          <CourseCard
            key={`${c.id}-${idx}`}
            course={c}
            imageIndex={idx}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="tz-dc-pagination-row">
        <div className="tz-dc-page-info">
          Hiển thị 1 - 12 trong 128 khóa học
        </div>
        <div className="tz-dc-pagination">
          <button className="tz-page-btn" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="tz-page-btn active">1</button>
          <button className="tz-page-btn">2</button>
          <button className="tz-page-btn">3</button>
          <button className="tz-page-btn">4</button>
          <button className="tz-page-btn">5</button>
          <span className="tz-page-dots">...</span>
          <button className="tz-page-btn">11</button>
          <button className="tz-page-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="tz-dc-per-page">
          12 / trang
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  );
}
