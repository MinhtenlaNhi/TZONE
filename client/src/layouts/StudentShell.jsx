import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { clearAuth, getAuth } from "../auth/auth";
import { canUseTeacherCourseLinkTools } from "../auth/teacherApproval";
import { COURSE_CATEGORIES } from "../data/studentCourses";
import { apiPath } from "../api/base";
import "./StudentShell.css";

function IconOverview({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCourses({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zM8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="18" height="14" viewBox="0 0 20 14" aria-hidden>
      <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L4.5 3H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconDdPerson() {
  return (
    <svg className="student-shell__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 20v-1a6 6 0 0112 0v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDdStar() {
  return (
    <svg className="student-shell__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l2.6 5.3L20 9.3l-4 3.9.9 5.8L12 16.9 7.1 19l.9-5.8-4-3.9 5.4-.9L12 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDdTests() {
  return (
    <svg className="student-shell__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5h10v16H5V9l4-4zM9 5v4H5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDdLogout() {
  return (
    <svg className="student-shell__dd-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2M10 12h10m0 0l-3-3m3 3l-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function accountBadgeLabel(user) {
  if (!user) return "Học sinh";
  if (user.role === "admin") return "Quản trị";
  if (user.accountType === "teacher") return "Giáo viên";
  return "Học sinh";
}

function shortDisplayName(user, fallback) {
  const n = user?.name?.trim();
  if (!n) return fallback;
  const parts = n.split(/\s+/);
  return parts[0] || fallback;
}

const nav = [
  { to: "/dashboard", label: "Tổng quan", Icon: IconOverview },
  { to: "/schedule", label: "Lịch học", Icon: IconCalendar },
  { to: "/my-courses", label: "Các khóa học của bạn", Icon: IconCourses }
];

export default function StudentShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(() => getAuth());
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const menuRef = useRef(null);
  const categoryRef = useRef(null);

  const activeCategoryId =
    location.pathname === "/dashboard" ? searchParams.get("category") : null;

  useEffect(() => {
    setUser(getAuth());
  }, [location.pathname, location.key]);

  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
      if (!categoryRef.current?.contains(e.target)) setCategoryOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") {
        setCategoryOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Bạn";
  const rawAvatar = user?.avatar || user?.picture || user?.googlePicture;
  const avatarUrl = rawAvatar ? (rawAvatar.startsWith("http") ? rawAvatar : apiPath(rawAvatar)) : null;
  const badgeText = accountBadgeLabel(user);
  const nameShort = shortDisplayName(user, displayName);

  function handleLogout() {
    clearAuth();
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  function selectCategory(categoryId) {
    setCategoryOpen(false);
    navigate({ pathname: "/dashboard", search: `?category=${encodeURIComponent(categoryId)}` });
  }

  return (
    <div className="student-shell">
      <header className="student-shell__header">
        <Link className="student-shell__logo" to="/">
          TZone
        </Link>
        <nav className="student-shell__nav" aria-label="Điều hướng chính">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `student-shell__nav-link ${isActive ? "student-shell__nav-link--active" : ""}`
              }
              end={to === "/dashboard"}
            >
              <Icon className="student-shell__nav-ico" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="student-shell__user" ref={menuRef}>
          <button
            type="button"
            className="student-shell__avatar-btn"
            aria-expanded={menuOpen}
            aria-label={`Tài khoản ${displayName}`}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="student-shell__avatar" width={40} height={40} referrerPolicy="no-referrer" />
            ) : (
              <span className="student-shell__avatar-fallback" aria-hidden>
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          {menuOpen ? (
            <div className="student-shell__dropdown" role="menu">
              <div className="student-shell__dd-header">
                <div className="student-shell__dd-header-avatar" aria-hidden>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" width={48} height={48} referrerPolicy="no-referrer" />
                  ) : (
                    <span className="student-shell__dd-header-fallback">{nameShort.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="student-shell__dd-header-text">
                  <div className="student-shell__dd-name-row">
                    <span className="student-shell__dd-badge">{badgeText}</span>
                    <span className="student-shell__dd-name">{nameShort}</span>
                  </div>
                  <p className="student-shell__dd-email">{user?.email}</p>
                </div>
              </div>
              <div className="student-shell__dd-sep" role="separator" />
              <Link className="student-shell__dd-link" to="/account" role="menuitem" onClick={() => setMenuOpen(false)}>
                <IconDdPerson />
                Thông tin cá nhân
              </Link>
              <Link className="student-shell__dd-link" to="/reviews" role="menuitem" onClick={() => setMenuOpen(false)}>
                <IconDdStar />
                Đánh giá
              </Link>
              <Link className="student-shell__dd-link" to="/tests" role="menuitem" onClick={() => setMenuOpen(false)}>
                <IconDdTests />
                Các bài kiểm tra
              </Link>
              {canUseTeacherCourseLinkTools(user) ? (
                <>
                  <div className="student-shell__dd-sep" role="separator" />
                  <Link
                    className="student-shell__dd-link"
                    to="/teacher/courses"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <IconDdTests />
                    Bảng điều khiển Giảng viên
                  </Link>
                  <Link
                    className="student-shell__dd-link"
                    to="/teacher/course-links"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <IconDdTests />
                    Gửi link buổi học
                  </Link>
                </>
              ) : null}
              {user?.role === "admin" ? (
                <>
                  <div className="student-shell__dd-sep" role="separator" />
                  <Link className="student-shell__dd-link" to="/admin" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <IconDdPerson />
                    Quản trị
                  </Link>
                </>
              ) : null}
              <div className="student-shell__dd-sep" role="separator" />
              <button
                type="button"
                className="student-shell__dd-link student-shell__dd-link--logout"
                role="menuitem"
                onClick={handleLogout}
              >
                <IconDdLogout />
                Đăng xuất
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="student-shell__toolbar">
        <div className="student-shell__category-wrap" ref={categoryRef}>
          <button
            type="button"
            className="student-shell__category"
            aria-expanded={categoryOpen}
            aria-haspopup="listbox"
            aria-label="Danh mục khóa học"
            onClick={() => setCategoryOpen((v) => !v)}
          >
            <IconMenu />
            <span>Danh mục</span>
          </button>
          {categoryOpen ? (
            <ul className="student-shell__category-dropdown" role="listbox" aria-label="Chọn danh mục">
              {COURSE_CATEGORIES.map((cat) => (
                <li key={cat.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={activeCategoryId === cat.id}
                    className={`student-shell__category-item ${
                      activeCategoryId === cat.id ? "student-shell__category-item--active" : ""
                    }`}
                    onClick={() => selectCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <label className="student-shell__search">
          <span className="student-shell__search-icon" aria-hidden>
            <IconSearch />
          </span>
          <input type="search" name="q" placeholder="Tìm kiếm khóa học" autoComplete="off" className="student-shell__search-input" />
        </label>
        <button type="button" className="student-shell__cart" aria-label="Giỏ hàng">
          <IconCart />
        </button>
      </div>

      <main className="student-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
