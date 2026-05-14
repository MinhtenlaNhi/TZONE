import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getAuth, clearAuth, setAuth } from "../auth/auth";
import { getCurrentUser } from "../api/auth";
import { apiPath } from "../api/base";
import "./TeacherShell.css";

// Keep only the used icons
const IconList = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconLink = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconHeadset = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>;
const IconMenu = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function TeacherShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getAuth());
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Sync latest user info (especially for teacher approval status changes)
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const data = await getCurrentUser();
        if (data?.success && data?.user) {
          // Merge old user state (which includes token if stored) with new user data
          setUser((prev) => {
            const nextUser = { ...prev, ...data.user };
            setAuth(nextUser);
            return nextUser;
          });
        }
      } catch (error) {
        console.error("Failed to sync user data:", error);
      }
    };

    if (user?.role === "teacher") {
      fetchLatestUser();
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Giáo viên";
  const rawAvatar = user?.avatar || user?.picture || user?.googlePicture;
  const avatarUrl = rawAvatar ? (rawAvatar.startsWith("http") ? rawAvatar : apiPath(rawAvatar)) : null;

  if (user?.role === "teacher" && user?.teacherApprovalStatus !== "approved") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '15px', fontSize: '1.5rem' }}>Tài khoản đang chờ phê duyệt</h2>
          <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '20px' }}>
            Xin chào <strong>{displayName}</strong>, tài khoản giáo viên của bạn hiện đang trong trạng thái <strong style={{ color: user?.teacherApprovalStatus === 'rejected' ? '#ef4444' : '#f59e0b' }}>{user?.teacherApprovalStatus === 'rejected' ? 'bị từ chối' : 'chờ phê duyệt'}</strong>.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Vui lòng liên hệ với Quản trị viên hệ thống để được xét duyệt quyền truy cập vào bảng điều khiển giáo viên.
          </p>
          <div style={{ marginTop: '25px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/dashboard" style={{ padding: '10px 24px', border: '1px solid #ddd', color: '#4b5563', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>
              Trang học viên
            </Link>
            <button onClick={handleLogout} style={{ padding: '10px 24px', background: 'var(--primary-color, #10b981)', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-layout">
      {/* OVERLAY FOR MOBILE */}
      <div 
        className={`ts-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`ts-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ts-logo">
          <h1>TZONE</h1>
          <p>Online Course Platform</p>
        </div>
        
        <nav className="ts-nav">
          <NavLink to="/teacher/dashboard" onClick={() => setSidebarOpen(false)} className={({isActive}) => `ts-nav-item ${isActive ? 'active' : ''}`} end>
            <IconHome /> Tổng quan
          </NavLink>
          <NavLink to="/teacher/courses" onClick={() => setSidebarOpen(false)} className={({isActive}) => `ts-nav-item ${isActive ? 'active' : ''}`}>
            <IconList /> Quản lý Lớp học
          </NavLink>
          <NavLink to="/teacher/course-links" onClick={() => setSidebarOpen(false)} className={({isActive}) => `ts-nav-item ${isActive ? 'active' : ''}`}>
            <IconLink /> Gắn link Meet
          </NavLink>
        </nav>

        <div className="ts-support-card">
          <div className="ts-support-icon">
            <IconHeadset />
          </div>
          <h4>Cần hỗ trợ?</h4>
          <p>Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
          <button className="ts-support-btn">Liên hệ hỗ trợ</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ts-main">
        {/* Top Header */}
        <header className="ts-header">
          <div className="ts-header-left">
            <button 
              className="ts-menu-btn" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <IconMenu width="24" height="24" />
            </button>
            <div className="ts-search-bar">
              <IconSearch />
              <input type="text" placeholder="Tìm kiếm khóa học..." />
            </div>
          </div>
          
          <div className="ts-header-right">
            <button className="ts-bell-btn">
              <IconBell />
              <span className="ts-bell-dot"></span>
            </button>
            
            <div className="ts-user-profile" ref={menuRef} onClick={() => setMenuOpen(!menuOpen)}>
              <div className="ts-user-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="ts-user-info">
                <span className="ts-user-name">{displayName}</span>
                <span className="ts-user-role">Giáo viên</span>
              </div>
              <svg className="ts-user-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              
              {menuOpen && (
                <div className="ts-user-dropdown">
                  <Link to="/account" className="ts-dropdown-item"><IconUser /> Thông tin cá nhân</Link>
                  <button onClick={handleLogout} className="ts-dropdown-item logout"><IconLogout /> Đăng xuất</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="ts-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
