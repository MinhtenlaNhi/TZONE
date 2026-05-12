import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./VnpayReturnPage.css";

export default function VnpayReturnPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Đang xử lý kết quả giao dịch...");
  const location = useLocation();

  useEffect(() => {
    const searchParams = location.search;
    
    if (!searchParams) {
      setStatus("error");
      setMessage("Không tìm thấy thông tin giao dịch.");
      return;
    }

    const verifyTransaction = async () => {
      try {
        const response = await fetch(`/api/vnpay/vnpay_return${searchParams}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus("success");
          setMessage("Thanh toán thành công! Cảm ơn bạn đã đăng ký khóa học.");
        } else {
          setStatus("error");
          setMessage(data.message || "Thanh toán thất bại hoặc bị hủy.");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("Lỗi kết nối đến máy chủ.");
      }
    };

    verifyTransaction();
  }, [location]);

  return (
    <div className="vnpay-return-page">
      <div className={`vnpay-card ${status}`}>
        {status === "loading" && <div className="spinner"></div>}
        {status === "success" && <div className="icon success">✓</div>}
        {status === "error" && <div className="icon error">✕</div>}
        
        <h2>{message}</h2>
        
        {status !== "loading" && (
          <div className="actions">
            <Link to="/orders" className="btn-primary">Xem đơn hàng</Link>
            <Link to="/" className="btn-secondary">Về trang chủ</Link>
          </div>
        )}
      </div>
    </div>
  );
}
