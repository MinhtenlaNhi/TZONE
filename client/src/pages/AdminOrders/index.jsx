import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAdminOrders, confirmOrder, cancelOrder } from "../../api/ordersApi";
import "./AdminOrders.css";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminOrders(page, 20, statusFilter);
      if (res.success) {
        setOrders(res.orders);
        setTotalPages(res.totalPages);
      } else {
        toast.error("Lỗi tải danh sách đơn hàng.");
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const handleConfirm = async (orderId) => {
    if (!window.confirm("Xác nhận đã nhận tiền và duyệt đơn hàng này?")) return;
    try {
      const res = await confirmOrder(orderId);
      if (res.success) {
        toast.success("Duyệt đơn hàng thành công!");
        loadOrders();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi duyệt đơn hàng");
    }
  };

  const handleCancel = async (orderId) => {
    const reason = window.prompt("Nhập lý do hủy (Tùy chọn):");
    if (reason === null) return; // cancel prompt

    try {
      const res = await cancelOrder(orderId, reason);
      if (res.success) {
        toast.success("Đã hủy đơn hàng");
        loadOrders();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi hủy đơn hàng");
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return <span className="status-badge status-pending">Chờ duyệt</span>;
      case "paid": return <span className="status-badge status-paid">Đã thanh toán</span>;
      case "cancelled": return <span className="status-badge status-cancelled">Đã hủy</span>;
      default: return status;
    }
  };

  return (
    <div className="admin-orders">
      <div className="admin-orders__header">
        <h1>Quản lý đơn hàng</h1>
        <p>Kiểm tra giao dịch chuyển khoản và cấp quyền vào lớp</p>
      </div>

      <div className="admin-orders__filters">
        <label>Trạng thái:</label>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="paid">Đã thanh toán</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="admin-orders__content">
        {loading ? (
          <p className="loading-text">Đang tải...</p>
        ) : orders.length === 0 ? (
          <p className="empty-text">Không có đơn hàng nào phù hợp.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Minh chứng</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td><code className="admin-code">{o._id.substring(18).toUpperCase()}</code></td>
                    <td>
                      <div><strong>{o.user?.name}</strong></div>
                      <div className="text-sm text-gray">{o.user?.email}</div>
                    </td>
                    <td>
                      <ul className="order-courses-list">
                        {o.items.map((i, idx) => (
                          <li key={idx}>- {i.courseRef?.title}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-red font-bold">{o.totalAmount.toLocaleString("vi-VN")}đ</td>
                    <td>{o.paymentMethod.toUpperCase()}</td>
                    <td>
                      {o.transferReceipt ? (
                        <button 
                          className="btn-view-receipt"
                          onClick={() => setSelectedReceipt(`${import.meta.env.VITE_API_URL || ""}${o.transferReceipt}`)}
                        >
                          Xem ảnh
                        </button>
                      ) : "-"}
                    </td>
                    <td>{getStatusLabel(o.status)}</td>
                    <td>
                      {o.status === "pending" && (
                        <div className="admin-action-btns">
                          <button className="btn-approve" onClick={() => handleConfirm(o._id)}>Duyệt</button>
                          <button className="btn-reject" onClick={() => handleCancel(o._id)}>Hủy</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
        </div>
      )}

      {/* Modal View Receipt */}
      {selectedReceipt && (
        <div className="receipt-modal" onClick={() => setSelectedReceipt(null)}>
          <div className="receipt-modal-content" onClick={e => e.stopPropagation()}>
            <button className="receipt-modal-close" onClick={() => setSelectedReceipt(null)}>×</button>
            <img src={selectedReceipt} alt="Receipt" />
          </div>
        </div>
      )}
    </div>
  );
}
