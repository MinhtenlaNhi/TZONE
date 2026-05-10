/**
 * Factory tạo middleware kiểm tra role.
 * Sử dụng SAU authMiddleware — đảm bảo req.user đã tồn tại.
 *
 * @param  {...string} roles — Danh sách role được phép (vd: "admin", "teacher").
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập." });
    }
    next();
  };
}

const isAdmin = requireRole("admin");
const isTeacher = requireRole("teacher", "admin");
const isStudent = requireRole("student", "admin");

module.exports = { requireRole, isAdmin, isTeacher, isStudent };
