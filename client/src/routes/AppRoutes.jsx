import { Navigate, Route, Routes, useParams } from "react-router-dom";
import HomePage from "../pages/Home";
import CourseCategoryTapSuPage from "../pages/CourseCategoryTapSu";
import CourseCategoryToeicAPage from "../pages/CourseCategoryToeicA";
import CourseCategoryToeicBPage from "../pages/CourseCategoryToeicB";
import CourseCategoryToeicSWPage from "../pages/CourseCategoryToeicSW";
import AllCoursesPage from "../pages/AllCoursesPage";
import CoursePublicDetailPage from "../pages/CoursePublicDetailPage";
import LoginPage from "../pages/Login";
import AdminTeachersPage from "../pages/Admin";
import AdminCategoriesPage from "../pages/AdminCategories";
import AdminCoursesPage from "../pages/AdminCourses";
import AdminCourseFormPage from "../pages/AdminCourseFormPage";
import OnboardingPage from "../pages/Onboarding";
import RegisterPage from "../pages/Register";
import RegisterDetailsPage from "../pages/RegisterDetails";
import DashboardHome from "../pages/DashboardHome";
import MyCoursesPage from "../pages/MyCoursesPage";
import LearningPage from "../pages/LearningPage";
import AssignmentPage from "../pages/AssignmentPage";
import TeacherCourseLinksPage from "../pages/TeacherCourseLinks";
import SchedulePage from "../pages/SchedulePage";
import ForgotPasswordPage from "../pages/ForgotPassword";
import ResetPasswordPage from "../pages/ResetPassword";
import ProfilePage from "../pages/Profile";
import MyReviewsPage from "../pages/MyReviewsPage";
import MyTestsPage from "../pages/MyTestsPage";

import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import VnpayReturnPage from "../pages/VnpayReturnPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import AdminOrdersPage from "../pages/AdminOrders";
import AdminReviewsPage from "../pages/AdminReviews";
import AdminDashboardPage from "../pages/AdminDashboard";
import AdminUsersPage from "../pages/AdminUsers";

import TeacherCoursesPage from "../pages/TeacherCoursesPage";
import TeacherLessonsPage from "../pages/TeacherLessonsPage";
import TeacherSubmissionsPage from "../pages/TeacherSubmissionsPage";

import AdminShell from "../layouts/AdminShell";
import StudentShell from "../layouts/StudentShell";
import AdminRoute from "./AdminRoute";
import OnboardingRoute from "./OnboardingRoute";
import PrivateRoute from "./PrivateRoute";

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
    <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>{title}</h1>
    <p style={{ color: "#6b7280" }}>Trang đang được phát triển.</p>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses/tap-su" element={<CourseCategoryTapSuPage />} />
      <Route path="/courses/toeic-a" element={<CourseCategoryToeicAPage />} />
      <Route path="/courses/toeic-b" element={<CourseCategoryToeicBPage />} />
      <Route path="/courses/toeic-sw" element={<CourseCategoryToeicSWPage />} />
      <Route path="/courses" element={<AllCoursesPage />} />
      <Route path="/courses/:id" element={<CoursePublicDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/details" element={<RegisterDetailsPage />} />
      <Route element={<PrivateRoute><StudentShell /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/schedule" element={<SchedulePage />} />
        
        {/* Cart & Orders */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/vnpay_return" element={<VnpayReturnPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />

        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/learn/:courseId" element={<LearningPage />} />
        <Route path="/learn/:courseId/assignment/:id" element={<AssignmentPage />} />
        <Route path="/teacher/course-links" element={<TeacherCourseLinksPage />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/reviews" element={<MyReviewsPage />} />
        <Route path="/tests" element={<MyTestsPage />} />

      </Route>
      
      {/* Teacher Routes */}
      <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
      <Route path="/teacher/courses/:courseId/lessons" element={<TeacherLessonsPage />} />
      <Route path="/teacher/lessons/:lessonId/submissions" element={<TeacherSubmissionsPage />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminShell />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="teachers" element={<AdminTeachersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="courses/create" element={<AdminCourseFormPage />} />
        <Route path="courses/edit/:id" element={<AdminCourseFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
