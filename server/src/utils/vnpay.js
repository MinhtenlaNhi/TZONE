const { VNPay, ignoreLogger } = require("vnpay");

let vnpayInstance = null;

function getVnpayInstance() {
  if (!vnpayInstance) {
    vnpayInstance = new VNPay({
      tmnCode: process.env.VNP_TMN_CODE,
      secureSecret: process.env.VNP_HASH_SECRET,
      vnpayHost: process.env.VNP_URL || 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: 'SHA512',
      enableLog: false,
      loggerFn: ignoreLogger,
    });
  }
  return vnpayInstance;
}

function generateVNPayUrl(ipAddr, orderId, amount, orderInfo, returnUrl) {
  const vnpay = getVnpayInstance();
  return vnpay.buildPaymentUrl({
    vnp_Amount: amount, // Thư viện vnpay tự động nhân 100
    vnp_IpAddr: ipAddr,
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other"
  });
}

function verifyVNPayReturn(vnp_Params) {
  const vnpay = getVnpayInstance();
  const verify = vnpay.verifyReturnUrl(vnp_Params);
  return verify.isSuccess;
}

function verifyVNPayIpn(vnp_Params) {
  const vnpay = getVnpayInstance();
  // IPN call xác minh giống với return URL nhưng dùng hàm verifyIpnCall nếu thư viện hỗ trợ
  try {
    const verify = vnpay.verifyIpnCall(vnp_Params);
    return verify.isSuccess;
  } catch (err) {
    // Fallback nếu có lỗi
    return false;
  }
}

module.exports = {
  generateVNPayUrl,
  verifyVNPayReturn,
  verifyVNPayIpn,
};
