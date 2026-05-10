import { apiFetchJson, apiPath } from "./base";

export async function fetchMyEnrollments() {
  return apiFetchJson(apiPath("/api/enrollments"));
}

export async function fetchCourseLessons(courseId) {
  return apiFetchJson(apiPath(`/api/enrollments/${courseId}/lessons`));
}

export async function updateCourseProgress(courseId, progress) {
  return apiFetchJson(apiPath(`/api/enrollments/${courseId}/progress`), {
    method: "PUT",
    body: JSON.stringify({ progress })
  });
}
