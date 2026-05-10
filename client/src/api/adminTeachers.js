import { apiPath } from "./base";

async function adminPost(path, body) {
  const res = await fetch(apiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Yêu cầu thất bại.");
  }
  return data;
}

export function fetchPendingTeachers({ adminEmail, adminPassword }) {
  return adminPost("/api/admin/pending-teachers", { adminEmail, adminPassword });
}

export function fetchAllTeachers({ adminEmail, adminPassword }) {
  return adminPost("/api/admin/teachers", { adminEmail, adminPassword });
}

export function approveTeacher({ adminEmail, adminPassword, teacherEmail }) {
  return adminPost("/api/admin/approve-teacher", { adminEmail, adminPassword, teacherEmail });
}

export function rejectTeacher({ adminEmail, adminPassword, teacherEmail }) {
  return adminPost("/api/admin/reject-teacher", { adminEmail, adminPassword, teacherEmail });
}
