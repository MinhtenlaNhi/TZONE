import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_STORAGE_KEY, getAuth } from "../../auth/auth";
import {
  clearPendingRegisterRole,
  consumePendingRegisterRole,
  markOnboardingComplete
} from "../../auth/onboardingStorage";
import "./styles.css";

const ROLE_OPTIONS = [
  { value: "student", label: "Tôi là học sinh" },
  { value: "teacher", label: "Tôi là giáo viên" }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [accountType, setAccountType] = useState("student");

  useEffect(() => {
    // Ưu tiên vai trò đã lưu trong DB (đăng nhập email) — không để "pending" từ /register ghi đè.
    const fromDb = getAuth()?.accountType;
    if (fromDb === "student" || fromDb === "teacher") {
      setAccountType(fromDb);
      clearPendingRegisterRole();
      return;
    }
    const pending = consumePendingRegisterRole();
    if (pending) setAccountType(pending);
  }, []);

  function handleContinue(e) {
    e.preventDefault();
    if (!auth?.email) {
      navigate("/login", { replace: true });
      return;
    }
    markOnboardingComplete(auth.email);
    try {
      const next = {
        ...auth,
        accountType,
        at: Date.now()
      };
      if (accountType === "teacher") {
        if (auth?.provider === "email") {
          next.teacherApprovalStatus = auth.teacherApprovalStatus ?? "pending";
        } else {
          delete next.teacherApprovalStatus;
        }
      } else {
        delete next.teacherApprovalStatus;
      }
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }

    if (
      accountType === "teacher" &&
      auth?.teacherApprovalStatus !== "approved"
    ) {
      window.alert(
        "Tài khoản giáo viên của bạn đang chờ quản trị viên phê duyệt. Bạn sẽ được thông báo khi được duyệt."
      );
    }

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="onboarding">
      <header className="onboarding__header">
        <Link className="onboarding__link-home" to="/">
          Trang chủ
        </Link>
        <Link className="onboarding__btn-register" to="/register">
          Đăng ký
        </Link>
      </header>

      <div className="onboarding__inner">
        <div className="onboarding__form-block">
          <p className="onboarding__kicker">CHÀO MỪNG BẠN ĐẾN VỚI</p>
          <h1 className="onboarding__brand">TZONE</h1>

          <form className="onboarding__form" onSubmit={handleContinue}>
            <label className="onboarding__label" htmlFor="onboarding-role">
              Vai trò của bạn
            </label>
            <select
              id="onboarding-role"
              className="onboarding__select"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="submit" className="onboarding__submit">
              Tiếp tục
            </button>
          </form>
        </div>

        <div className="onboarding__art" aria-hidden>
          <div className="onboarding__img-wrap">
            <img
              className="onboarding__img"
              src="/images/onboarding-illustration.png"
              alt="Minh họa học viên học online"
              width={520}
              height={420}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
