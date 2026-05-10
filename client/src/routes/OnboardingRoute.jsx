import { Navigate } from "react-router-dom";
import { getAuth } from "../auth/auth";
import { hasCompletedOnboarding } from "../auth/onboardingStorage";

export default function OnboardingRoute({ children }) {
  const auth = getAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  if (auth.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (hasCompletedOnboarding(auth.email)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
