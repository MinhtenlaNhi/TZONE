import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAdminReviews, toggleHideReview, deleteReview } from "../../api/reviewsApi";
import StarRating from "../../components/StarRating";
import "./AdminReviews.css";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourseId, setFilterCourseId] = useState("");
  const [coursesFilterList, setCoursesFilterList] = useState([]); // Danh sách course có review để làm bộ lọc

  useEffect(() => {
    loadReviews();
  }, [filterCourseId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminReviews(filterCourseId);
      if (res.success) {
        setReviews(res.reviews || []);
        
        // Extract unique courses for filter dropdown
        if (!filterCourseId) {
          const uniqueCoursesMap = new Map();
          (res.reviews || []).forEach(r => {
            if (r.courseRef) uniqueCoursesMap.set(r.courseRef._id, r.courseRef.title);
          });
          const coursesList = Array.from(uniqueCoursesMap).map(([id, title]) => ({ id, title }));
          setCoursesFilterList(coursesList);
        }
      } else {
        toast.error("Lỗi lấy danh sách đánh giá.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHide = async (id, currentStatus) => {
    try {
      const res = await toggleHideReview(id);
      if (res.success) {
        toast.success(res.message);
        setReviews(reviews.map(r => r._id === id ? { ...r, isHidden: res.isHidden } : r));
      }
    } catch (e) {
      toast.error("Lỗi cập nhật trạng thái.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn? Hành động này sẽ cập nhật lại điểm trung bình của khóa học.")) return;
    
    try {
      const res = await deleteReview(id);
      if (res.success) {
        toast.success("Đã xóa đánh giá.");
        setReviews(reviews.filter(r => r._id !== id));
      }
    } catch (e) {
      toast.error("Lỗi xóa đánh giá.");
    }
  };

  return (
    <div className="admin-reviews">
      <div className="admin-header-flex">
        <h2>Quản lý Đánh giá (Reviews)</h2>
        <div className="filter-group">
          <select value={filterCourseId} onChange={e => setFilterCourseId(e.target.value)}>
            <option value="">Tất cả Khóa học</option>
            {coursesFilterList.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : reviews.length === 0 ? (
        <p>Chưa có đánh giá nào.</p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Khóa học</th>
                <th>Đánh giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(rev => (
                <tr key={rev._id} className={rev.isHidden ? "row-hidden" : ""}>
                  <td>
                    <strong>{rev.userRef?.name}</strong><br />
                    <span className="text-sm text-gray">{rev.userRef?.email}</span>
                  </td>
                  <td>{rev.courseRef?.title}</td>
                  <td>
                    <div className="review-rating-admin">
                      <StarRating rating={rev.rating} />
                      <span className="text-sm">({rev.rating} sao)</span>
                    </div>
                    {rev.comment && <p className="admin-comment-text">"{rev.comment}"</p>}
                  </td>
                  <td>
                    {rev.isHidden ? (
                      <span className="badge badge-error">Đang Ẩn</span>
                    ) : (
                      <span className="badge badge-success">Công khai</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className={`btn btn-sm ${rev.isHidden ? 'btn-success' : 'btn-warning'}`}
                      onClick={() => handleToggleHide(rev._id, rev.isHidden)}
                    >
                      {rev.isHidden ? "Cho phép hiện" : "Ẩn đánh giá"}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger ml-2"
                      onClick={() => handleDelete(rev._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
