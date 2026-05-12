const express = require("express");
const router = express.Router();
const { verifyVNPayReturn } = require("../utils/vnpay");
const Order = require("../models/Order");
const Enrollment = require("../models/Enrollment");

// 1. IPN Route (VNPay gọi server khi giao dịch hoàn tất)
router.get("/vnpay_ipn", async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    const orderId = vnp_Params["vnp_TxnRef"];
    const rspCode = vnp_Params["vnp_ResponseCode"];

    if (verifyVNPayReturn(vnp_Params)) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      if (order.status === "paid" || order.status === "cancelled") {
        return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      }

      if (rspCode === "00") {
        // Thanh toán thành công
        order.status = "paid";
        await order.save();

        // Tạo enrollment
        for (const item of order.items) {
          await Enrollment.deleteOne({ user: order.user, course: item.courseRef, isTrial: true });
          await Enrollment.create({
            user: order.user,
            course: item.courseRef,
            order: order._id,
            isTrial: false
          });
        }
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      } else {
        // Thanh toán thất bại
        order.status = "cancelled";
        order.cancelReason = "VNPay thanh toán thất bại. Mã: " + rspCode;
        await order.save();
        return res.status(200).json({ RspCode: "00", Message: "Success" });
      }
    } else {
      return res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
    }
  } catch (err) {
    console.error(err);
    return res.status(200).json({ RspCode: "99", Message: "Unknow error" });
  }
});

// 2. Return Route (Frontend gọi để kiểm tra kết quả hiển thị cho user)
router.get("/vnpay_return", async (req, res) => {
  try {
    let vnp_Params = req.query;
    const rspCode = vnp_Params["vnp_ResponseCode"];

    if (verifyVNPayReturn(vnp_Params)) {
      if (rspCode === "00") {
        return res.json({ success: true, message: "Giao dịch thành công" });
      } else {
        return res.json({ success: false, message: "Giao dịch thất bại. Mã lỗi: " + rspCode });
      }
    } else {
      return res.json({ success: false, message: "Chữ ký không hợp lệ (Invalid Checksum)" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
  }
});

module.exports = router;
