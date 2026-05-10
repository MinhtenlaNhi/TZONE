import { apiPath } from "./base";

export async function fetchCourseLinks(courseId) {
  const res = await fetch(apiPath(`/api/course-links/${encodeURIComponent(courseId)}`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Không tải được link buổi học.");
  }
  return data;
}

/** Giáo viên / admin (tài khoản email + mật khẩu trong DB) */
export async function putCourseSessionLink({ courseId, email, password, weekdayCol, meetUrl }) {
  const res = await fetch(apiPath(`/api/course-links/${encodeURIComponent(courseId)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, weekdayCol, meetUrl })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Không lưu được link.");
  }
  return data;
}
