import { Link } from "react-router-dom";
import UserNavMenu from "../UserNavMenu";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);

export default function PublicHeader() {
  return (
    <header className="tz-home-header">
      <div className="tz-nav-container">
        <div className="tz-nav-left">
          <Link to="/" className="tz-logo">
            <span className="tz-logo-icon">TZ</span> TZONE
          </Link>
          <button className="tz-btn-category">
            <HamburgerIcon /> Danh mục
          </button>
        </div>
        
        <div className="tz-nav-search">
          <div className="tz-search-pill">
            <input type="text" placeholder="Tìm kiếm khóa học..." />
            <button><SearchIcon /></button>
          </div>
        </div>

        <div className="tz-nav-right">
          <button className="tz-btn-cart">
            <CartIcon />
            <span className="tz-cart-badge">0</span>
          </button>
          <UserNavMenu />
        </div>
      </div>
    </header>
  );
}
