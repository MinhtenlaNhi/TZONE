import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiFetchJson } from "../../api/base";
import { fetchCategories } from "../../api/categories";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "../../pages/Home/styles.css";
import "./AllCourses.css";
import { apiPath } from "../../api/base";

// --- SVG Icons ---
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

function IconUserCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  );
}

export default function AllCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "createdAt_desc"
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12; // Adjusted for 4 columns

  useEffect(() => {
    fetchCategories().then(res => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.search) query.append("search", filters.search);
      if (filters.category) query.append("category", filters.category);
      if (filters.minPrice) query.append("minPrice", filters.minPrice);
      if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
      if (filters.sort) query.append("sort", filters.sort);
      query.append("page", page);
      query.append("limit", limit);

      const res = await apiFetchJson(`/api/courses?${query.toString()}`);
      if (res.success) {
        setCourses(res.courses);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name !== 'search' && name !== 'minPrice' && name !== 'maxPrice') {
      setPage(1);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  // Helper to extract large initials for the card cover
  const getCoverInitials = (catName, courseTitle) => {
    const text = catName?.toUpperCase() || courseTitle?.toUpperCase() || "KH";
    if (text.includes("TOEIC B")) return "TB";
    if (text.includes("TOEIC A")) return "TA";
    if (text.includes("TẬP SỰ")) return "TS";
    if (text.includes("SPEAKING")) return "TS"; // As in mockup
    return text.substring(0, 2);
  };

  // Mapping specific categories to colors to match the design exactly
  const getCoverColorClass = (catName) => {
    const name = catName?.toUpperCase() || "";
    if (name.includes("TOEIC B")) return "tz-cover-green";
    if (name.includes("TOEIC A")) return "tz-cover-blue";
    if (name.includes("TẬP SỰ")) return "tz-cover-orange";
    if (name.includes("SPEAKING")) return "tz-cover-blue";
    return "tz-cover-blue"; // default
  };

  return (
    <div className="tz-all-courses-page">
      <PublicHeader />

      <div className="tz-ac-wrapper">
        {/* Hero Header Banner */}
        <div className="tz-ac-header-card">
          <div className="tz-ac-header-content">
            <h1>Khám phá các khóa học tại TZONE</h1>
            <p>Lộ trình học tập rõ ràng, phương pháp hiện đại giúp bạn đạt mục tiêu TOEIC nhanh nhất.</p>
          </div>
          <div className="tz-ac-header-graphic">
            <img src="/assets/header-graphic.png" alt="" onError={(e) => {
              // Placeholder for missing illustration
              e.target.src = 'https://cdni.iconscout.com/illustration/premium/thumb/graduation-cap-with-books-and-diploma-4809282-3996113.png';
            }} />
          </div>
        </div>

        {/* Main Content overlapping banner */}
        <div className="tz-ac-layout">
          {/* Sidebar */}
          <aside className="tz-ac-sidebar">
            {/* Top Box: Count */}
            <div className="tz-ac-widget tz-ac-widget-count">
              <div className="tz-ac-results-count">
                <IconFilter /> Tìm thấy <strong>{total}</strong> khóa học
              </div>
            </div>

            {/* Bottom Box: Filters */}
            <div className="tz-ac-widget tz-ac-widget-filters">
              <h2 className="tz-ac-widget-main-title">Bộ lọc tìm kiếm</h2>

              <form onSubmit={handleSearchSubmit} className="tz-ac-search-box">
                <input
                  type="text"
                  name="search"
                  placeholder="Nhập tên khóa học..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <button type="submit" aria-label="Tìm kiếm">
                  <IconSearch />
                </button>
              </form>

              <div className="tz-ac-widget-section">
                <h3 className="tz-ac-widget-title">Danh mục</h3>
                <div className="tz-ac-radio-group">
                  <label className="tz-ac-custom-radio">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ""}
                      onChange={handleFilterChange}
                    />
                    <span className="tz-radio-mark"></span>
                    Tất cả các khóa
                  </label>
                  {categories.map(c => (
                    <label key={c.id} className="tz-ac-custom-radio">
                      <input
                        type="radio"
                        name="category"
                        value={c.id}
                        checked={filters.category === c.id}
                        onChange={handleFilterChange}
                      />
                      <span className="tz-radio-mark"></span>
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="tz-ac-widget-section">
                <h3 className="tz-ac-widget-title">Khoảng giá (VNĐ)</h3>
                <div className="tz-ac-price-range">
                  <input type="number" name="minPrice" placeholder="Tối thiểu" value={filters.minPrice} onChange={handleFilterChange} />
                  <span className="tz-price-divider">~</span>
                  <input type="number" name="maxPrice" placeholder="Tối đa" value={filters.maxPrice} onChange={handleFilterChange} />
                </div>
                <button className="tz-ac-btn-apply" onClick={loadCourses}>
                  <IconFilter /> Áp dụng
                </button>
              </div>
            </div>
          </aside>

          {/* Main Grid Area */}
          <main className="tz-ac-main">
            {/* Sort Bar */}
            <div className="tz-ac-sort-bar">
              <div className="tz-ac-sort-label">Sắp xếp: Mới nhất</div>
              <div className="tz-ac-sort-box">
                <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                  <option value="createdAt_desc">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="rating_desc">Đánh giá cao nhất</option>
                </select>
                <div className="tz-sort-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="tz-ac-loading">
                <div className="spinner"></div>
                <p>Đang tải khóa học...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="tz-ac-empty">
                <div className="tz-ac-empty-icon">📂</div>
                <p>Không tìm thấy khóa học nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div className="tz-ac-grid">
                {courses.map(course => {
                  const catName = course.categoryRef?.name || course.categoryId;
                  const colorClass = getCoverColorClass(catName);
                  const coverText = getCoverInitials(catName, course.title);

                  return (
                    <Link to={`/courses/${course.id}`} key={course._id} className="tz-course-card">
                      {/* Cover Area */}
                      {course.thumbnail ? (
                        <div className="tz-cc-cover-img" style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                          <img src={apiPath(course.thumbnail)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span className="tz-cc-badge-dark" style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>{catName}</span>
                          <button className="tz-cc-favorite-heart" style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} onClick={(e) => e.preventDefault()}>
                            <IconHeart />
                          </button>
                        </div>
                      ) : (
                        <div className={`tz-cc-cover-colored ${colorClass}`}>
                          <div className="tz-cc-cover-text">{coverText}</div>
                          <span className="tz-cc-badge-dark">{catName}</span>
                          <button className="tz-cc-favorite-heart" onClick={(e) => e.preventDefault()}>
                            <IconHeart />
                          </button>
                        </div>
                      )}

                      {/* Info Area */}
                      <div className="tz-cc-body">
                        <h3 className="tz-cc-title">{course.title}</h3>

                        <div className="tz-cc-meta-row">
                          <div className="tz-cc-meta-item">
                            <IconStar />
                            <span>{course.rating || "4.5"} ({course.ratingLabel || "-"})</span>
                          </div>
                          <div className="tz-cc-meta-item">
                            <IconUsers />
                            <span>{course.enrolled || 0} HV</span>
                          </div>
                        </div>

                        <div className="tz-cc-schedule">
                          <IconCalendar />
                          <span>{course.schedule || 'Sáng 3-5-7 | 9h-10h30'}</span>
                        </div>
                      </div>

                      {/* Footer Area */}
                      <div className="tz-cc-footer">
                        <div className="tz-cc-instructor">
                          <IconUserCircle />
                          <span>CT3102</span>
                        </div>
                        <div className="tz-cc-price">
                          {course.price ? (course.price.toString().includes('đ') ? course.price : `${course.price.toLocaleString()}đ`) : 'Miễn phí'}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="tz-ac-pagination-row">
                <div className="tz-ac-pagination">
                  <button
                    className="tz-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`tz-page-btn tz-page-num ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="tz-page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>



      </div>
      <PublicFooter />
    </div>
  );
}
