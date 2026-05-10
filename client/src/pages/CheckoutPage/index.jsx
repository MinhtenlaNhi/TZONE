import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCart } from "../../api/cartApi";
import { createOrder } from "../../api/ordersApi";
import { getAuth } from "../../auth/auth";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Thông tin ngân hàng cứng (hoặc có thể load từ API)
  const bankInfo = {
    bankName: import.meta.env.VITE_BANK_NAME || "Techcombank",
    accountNumber: import.meta.env.VITE_BANK_ACCOUNT || "190366668888",
    accountName: import.meta.env.VITE_BANK_OWNER || "PHAM DINH QUANG"
  };

  useEffect(() => {
    if (!auth) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    const loadCart = async () => {
      try {
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
    loadCart();
  }, [auth, navigate]);

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

  if (loading) {
    return <div className="checkout-loading">Đang tải thông tin...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Không có khóa học nào để thanh toán</h2>
        <Link to="/courses" className="btn-primary">Xem khóa học</Link>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "transfer" && !receiptFile) {
      toast.error("Vui lòng tải lên ảnh minh chứng chuyển khoản!");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("paymentMethod", paymentMethod);
      if (receiptFile) {
        formData.append("transferReceipt", receiptFile);
      }

      const res = await createOrder(formData);
      if (res.success) {
        toast.success("Đặt hàng thành công!");
        navigate("/orders"); // Chuyển đến trang lịch sử đơn hàng
      } else {
        toast.error(res.message || "Có lỗi xảy ra khi đặt hàng.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__header">
        <h1>Thanh toán</h1>
        <p>Vui lòng hoàn tất thanh toán để tham gia khóa học</p>
      </div>

      <div className="checkout-page__layout">
        <div className="checkout-page__main">
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-section">
              <h2>1. Phương thức thanh toán</h2>
              <div className="payment-methods">
                <label className={`pm-option ${paymentMethod === 'transfer' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="transfer" 
                    checked={paymentMethod === "transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="pm-label">Chuyển khoản ngân hàng</span>
                </label>
                
                <label className={`pm-option ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="vnpay" 
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="pm-label">VNPAY (Sandbox)</span>
                </label>
              </div>
            </div>

            {paymentMethod === "transfer" && (
              <div className="checkout-section transfer-details">
                <h2>2. Thông tin chuyển khoản</h2>
                <div className="bank-info-card">
                  <p><strong>Ngân hàng:</strong> {bankInfo.bankName}</p>
                  <p><strong>Chủ tài khoản:</strong> {bankInfo.accountName}</p>
                  <p><strong>Số tài khoản:</strong> <span className="highlight-account">{bankInfo.accountNumber}</span></p>
                  <p><strong>Số tiền:</strong> <span className="highlight-amount">{totalAmount.toLocaleString("vi-VN")}đ</span></p>
                  <p><strong>Nội dung CK:</strong> TZONE {auth.email}</p>
                </div>

                <div className="upload-receipt-group">
                  <label>Tải lên ảnh minh chứng chuyển khoản (Bắt buộc) <span className="text-danger">*</span></label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                  />
                  {receiptPreview && (
                    <div className="receipt-preview">
                      <img src={receiptPreview} alt="Receipt preview" />
                    </div>
                  )}
                  <p className="help-text">Sau khi đặt hàng, Admin sẽ kiểm tra và duyệt đơn hàng của bạn.</p>
                </div>
              </div>
            )}

            {paymentMethod === "vnpay" && (
              <div className="checkout-section vnpay-details">
                <p>Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán VNPAY an toàn.</p>
                <p><em>(Mock Sandbox: Giao dịch sẽ tự động thành công và bạn được duyệt vào lớp ngay lập tức).</em></p>
              </div>
            )}

            <div className="checkout-actions">
              <Link to="/cart" className="btn-cancel">← Quay lại giỏ hàng</Link>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Xác nhận & Đặt hàng"}
              </button>
            </div>
          </form>

        </div>

        <aside className="checkout-page__sidebar">
          <div className="order-summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="order-items-mini">
              {items.map((item) => {
                const course = item.courseRef;
                if (!course) return null;
                return (
                  <div className="order-item-mini" key={course._id}>
                    <div className="oim-title">{course.title}</div>
                    <div className="oim-price">{course.price || "Miễn phí"}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="order-total">
              <span>Tổng thanh toán</span>
              <span className="total-amount-highlight">{totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
