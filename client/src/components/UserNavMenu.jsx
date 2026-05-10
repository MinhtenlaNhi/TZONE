import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../auth/auth";
import "./UserNavMenu.css";

export default function UserNavMenu() {
  const [user, setUser] = useState(() => getAuth());
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getAuth());
  }, [location.pathname, location.key]);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  if (!user?.email) {
    return (
      <div className="auth-buttons">
        <Link to="/login" className="auth-link">
          Đăng nhập
        </Link>
        <Link to="/register" className="auth-btn-register">
          Đăng ký
        </Link>
      </div>
    );
  }

  const displayName = user.name || user.email.split("@")[0] || "Tài khoản";
  const avatarUrl = user.picture;

  function handleLogout() {
    clearAuth();
    setUser(null);
    setOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <div className="auth-buttons user-nav" ref={wrapRef}>
      <button
        type="button"
        className="user-nav__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Tài khoản: ${displayName}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="user-nav__avatar-wrap">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="user-nav__avatar"
              width={36}
              height={36}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="user-nav__avatar-fallback" aria-hidden>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
        <span className="user-nav__name">{displayName}</span>
        <span className={`user-nav__chev ${open ? "user-nav__chev--open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="user-nav__dropdown" role="menu">
          <Link
            className="user-nav__item"
            role="menuitem"
            to="/account"
            onClick={() => setOpen(false)}
          >
            Thông tin tài khoản
          </Link>
          {user.role === "admin" ? (
            <Link
              className="user-nav__item"
              role="menuitem"
              to="/admin"
              onClick={() => setOpen(false)}
            >
              Quản trị
            </Link>
          ) : null}
          <button type="button" className="user-nav__item user-nav__item--danger" role="menuitem" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}
