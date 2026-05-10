import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CoursesProvider } from "./context/CoursesContext";
import AppRoutes from "./routes/AppRoutes";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function AppRoutesTree() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <CoursesProvider>
        <AppRoutes />
      </CoursesProvider>
    </BrowserRouter>
  );
}

export default function App() {
  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppRoutesTree />
      </GoogleOAuthProvider>
    );
  }
  return <AppRoutesTree />;
}
