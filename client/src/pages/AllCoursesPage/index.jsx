import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiFetchJson } from "../../api/base";
import { fetchCategories } from "../../api/categories";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "../../pages/Home/styles.css"; // Import styles from Home to reuse Header/Footer styles
import "./AllCourses.css";

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
  const limit = 9;

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
    setPage(1); // Reset page on filter change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCourses();
  };

  // Helper function: get initials for placeholder logo
  const getInitials = (name) => {
    if (!name) return 'TZ';
    const words = name.split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function: pick a random color based on string
  const getBadgeColorClass = (categoryName) => {
    const classes = ['tz-badge-green', 'tz-badge-teal', 'tz-badge-orange', 'tz-badge-purple', 'tz-badge-blue'];
    if (!categoryName) return classes[0];
    const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return classes[hash % classes.length];
  };

  return (
    <div className="tz-all-courses-page">
      <PublicHeader />
      {/* Hero Header */}
      <div className="tz-ac-header">
        <div className="tz-ac-header-content">
          <h1>Khám phá các khóa học tại TZONE</h1>
          <p>Lộ trình học tập rõ ràng, phương pháp hiện đại giúp bạn đạt mục tiêu TOEIC nhanh nhất.</p>
        </div>
      </div>

      <div className="tz-ac-container">
        <div className="tz-ac-layout">
          {/* Sidebar Filters */}
          <aside className="tz-ac-sidebar">
            <div className="tz-ac-widget">
              <h3 className="tz-ac-widget-title">Tìm kiếm</h3>
              <form onSubmit={handleSearchSubmit} className="tz-ac-search-box">
                <input 
                  type="text" 
                  name="search" 
                  placeholder="Nhập tên khóa học..." 
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <button type="submit" aria-label="Tìm kiếm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </form>
            </div>

            <div className="tz-ac-widget">
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

            <div className="tz-ac-widget">
              <h3 className="tz-ac-widget-title">Khoảng giá (VNĐ)</h3>
              <div className="tz-ac-price-range">
                <input type="number" name="minPrice" placeholder="Tối thiểu" value={filters.minPrice} onChange={handleFilterChange} />
                <span className="tz-price-divider">-</span>
                <input type="number" name="maxPrice" placeholder="Tối đa" value={filters.maxPrice} onChange={handleFilterChange} />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="tz-ac-main">
            <div className="tz-ac-toolbar">
              <div className="tz-ac-results-count">
                Tìm thấy <strong>{total}</strong> khóa học
              </div>
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
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <p>Không tìm thấy khóa học nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div className="tz-ac-grid">
                {courses.map(course => {
                  const catName = course.categoryRef?.name || course.categoryId;
                  const badgeClass = getBadgeColorClass(catName);
                  
                  return (
                    <Link to={`/courses/${course.id}`} key={course._id} className="tz-course-card">
                      <div className="tz-cc-cover">
                        {course.thumbnail ? (
                          <img src={`${import.meta.env.VITE_API_URL || ""}${course.thumbnail}`} alt={course.title} className="tz-cc-img" />
                        ) : (
                          <div className={`tz-cc-placeholder ${badgeClass}`}>
                            <span className="tz-cc-initials">{getInitials(course.title)}</span>
                          </div>
                        )}
                        <span className={`tz-cc-badge ${badgeClass}`}>{catName}</span>
                      </div>
                      <div className="tz-cc-body">
                        <h3 className="tz-cc-title">{course.title}</h3>
                        
                        <div className="tz-cc-meta-row">
                          <div className="tz-cc-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            <span>{course.rating} ({course.ratingLabel || 0})</span>
                          </div>
                          <div className="tz-cc-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <span>{course.enrolled} HV</span>
                          </div>
                        </div>

                        <div className="tz-cc-schedule">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          <span>{course.schedule || 'Linh hoạt'}</span>
                        </div>
                      </div>
                      <div className="tz-cc-footer">
                        <div className="tz-cc-instructor">
                          <div className="tz-inst-avatar">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          </div>
                          <span>{course.instructor || 'TZONE'}</span>
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
            )}
          </main>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
