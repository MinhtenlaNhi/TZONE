import { apiFetchJson, apiPath } from "./base";

export async function fetchTeacherCourses() {
  return apiFetchJson(apiPath("/api/teacher/courses"));
}

export async function fetchTeacherCourseStudents(courseId) {
  return apiFetchJson(apiPath(`/api/teacher/courses/${courseId}/students`));
}

export async function createTeacherSection(courseId, sectionTitle) {
  return apiFetchJson(apiPath(`/api/teacher/courses/${courseId}/sections`), {
    method: "POST",
    body: JSON.stringify({ sectionTitle })
  });
}

export async function createTeacherLesson(courseId, sectionIndex, title, isFreePreview = false) {
  return apiFetchJson(apiPath(`/api/teacher/courses/${courseId}/lessons`), {
    method: "POST",
    body: JSON.stringify({ sectionIndex, title, isFreePreview })
  });
}

export async function uploadLessonMaterial(lessonId, file, title = "") {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  return apiFetchJson(apiPath(`/api/teacher/lessons/${lessonId}/materials`), {
    method: "POST",
    body: formData // auto set multipart/form-data
  });
}

export async function createLessonAssignment(lessonId, assignmentData) {
  return apiFetchJson(apiPath(`/api/teacher/lessons/${lessonId}/assignments`), {
    method: "POST",
    body: JSON.stringify(assignmentData)
  });
}

export async function updateLessonAssignment(lessonId, assignmentId, assignmentData) {
  return apiFetchJson(apiPath(`/api/teacher/lessons/${lessonId}/assignments/${assignmentId}`), {
    method: "PUT",
    body: JSON.stringify(assignmentData)
  });
}

export async function fetchAssignmentSubmissions(assignmentId) {
  return apiFetchJson(apiPath(`/api/teacher/assignments/${assignmentId}/submissions`));
}

export async function fetchLessonSubmissions(lessonId) {
  return apiFetchJson(apiPath(`/api/teacher/lessons/${lessonId}/submissions`));
}

export async function gradeSubmission(submissionId, score, teacherComment) {
  return apiFetchJson(apiPath(`/api/teacher/submissions/${submissionId}/grade`), {
    method: "PUT",
    body: JSON.stringify({ score, teacherComment })
  });
}
