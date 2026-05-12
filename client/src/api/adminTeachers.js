import { apiFetchJson } from "./base";

export async function fetchPendingTeachers() {
  return apiFetchJson("/api/admin-teachers/pending-teachers");
}

export async function fetchAllTeachers() {
  return apiFetchJson("/api/admin-teachers/teachers");
}

export async function approveTeacher({ teacherEmail }) {
  return apiFetchJson("/api/admin-teachers/approve-teacher", {
    method: "POST",
    body: JSON.stringify({ teacherEmail })
  });
}

export async function rejectTeacher({ teacherEmail }) {
  return apiFetchJson("/api/admin-teachers/reject-teacher", {
    method: "POST",
    body: JSON.stringify({ teacherEmail })
  });
}
