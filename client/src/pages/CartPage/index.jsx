import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCart, removeFromCart } from "../../api/cartApi";
import { getAuth } from "../../auth/auth";
import "./CartPage.css";

export default function CartPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await fetchCart();
      if (res.success) {
        setCart(res.cart);
      }
    } catch (e) {
      toast.error("Không thể tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    loadCart();
  }, [auth, navigate]);

  const handleRemove = async (courseId) => {
    try {
      const res = await removeFromCart(courseId);
      if (res.success) {
        toast.success("Đã xóa khỏi giỏ hàng");
        loadCart(); // Reload
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi xóa khóa học");
    }
  };

  if (loading) {
    return <div className="cart-page-loading">Đang tải giỏ hàng...</div>;
  }

  const items = cart?.items || [];

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const course = item.courseRef;
      if (!course || !course.price) return total;
      const numStr = course.price.replace(/[^\d]/g, "");
      return total + (parseInt(numStr, 10) || 0);
    }, 0);
  };

  const totalAmount = calculateTotal();

  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <h1>Giỏ hàng của bạn</h1>
        <p>Bạn có {items.length} khóa học trong giỏ hàng</p>
      </div>

      {items.length === 0 ? (
        <div className="cart-page__empty">
          <p>Giỏ hàng đang trống.</p>
          <Link to="/courses" className="btn-primary">Khám phá khóa học ngay</Link>
        </div>
      ) : (
        <div className="cart-page__content">
          <div className="cart-page__list">
            {items.map((item) => {
              const course = item.courseRef;
              if (!course) return null;

              return (
                <div className="cart-item" key={course._id}>
                  <div className="cart-item__img">
                    {course.thumbnail ? (
                      <img src={`${import.meta.env.VITE_API_URL || ""}${course.thumbnail}`} alt={course.title} />
                    ) : (
                      <div className="cart-item__placeholder">TZONE</div>
                    )}
                  </div>
                  <div className="cart-item__info">
                    <div className="cart-item__cat">{course.categoryRef?.name}</div>
                    <h3 className="cart-item__title">{course.title}</h3>
                    <div className="cart-item__meta">
                      🕒 {course.totalSessions} buổi ({course.sessionDuration} phút/buổi)
                    </div>
                  </div>
                  <div className="cart-item__price-actions">
                    <div className="cart-item__price">{course.price || "Miễn phí"}</div>
                    <button className="cart-item__remove" onClick={() => handleRemove(course._id)}>Xóa</button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-page__summary">
            <h3>Tổng giỏ hàng</h3>
            <div className="summary-row">
              <span>Tổng cộng:</span>
              <span className="summary-total">{totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
            <Link to="/checkout" className="btn-checkout">Tiến hành thanh toán</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
