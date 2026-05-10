export const AUTH_STORAGE_KEY = "tzone_auth";
export const TOKEN_STORAGE_KEY = "tzone_token";

/** Email Google được cấp quyền quản trị (so khớp không phân biệt hoa thường). */
export const ADMIN_EMAILS = new Set(["pdquang050203@gmail.com"]);

export function resolveRole(email) {
  const e = String(email || "")
    .toLowerCase()
    .trim();
  return ADMIN_EMAILS.has(e) ? "admin" : "user";
}

/** Lưu JWT token */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

/** Lấy JWT token */
export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
}

/** Lưu thông tin user (JSON) vào session */
export function setAuth(data) {
  if (data) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  }
}

export function getAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.email) return null;
    // Luôn đồng bộ từ ADMIN_EMAILS — tránh session cũ còn role sai sau khi đổi cấu hình.
    if (ADMIN_EMAILS.has(data.email?.toLowerCase())) {
      data.role = "admin";
    }
    return data;
  } catch {
    return null;
  }
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isAdminSession() {
  return getAuth()?.role === "admin";
}
