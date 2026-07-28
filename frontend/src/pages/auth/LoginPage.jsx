import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "@/api/core";
import usePermission from "@/hooks/usePermission";

const DEFAULT_REDIRECT = "/dashboard";
const NAV_REDIRECT_PRIORITY = [
  { module: "admissions", path: "/admissions" },
  { module: "students", path: "/students" },
  { module: "faculty", path: "/faculty" },
  { module: "academics", path: "/academics" },
  { module: "lms", path: "/lms" },
  { module: "exams", path: "/exams" },
  { module: "fees", path: "/fees" },
  { module: "dashboard", path: "/dashboard" },
  { module: "users", path: "/users" },
  { module: "settings", path: "/settings/shared-masters" }
];

function LoginPage() {
  const navigate = useNavigate();
  const { user, permissionMatrix, refreshSession } = usePermission();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = useMemo(() => {
    const firstMatch = NAV_REDIRECT_PRIORITY.find((item) => permissionMatrix?.[item.module]?.view);
    return firstMatch?.path || DEFAULT_REDIRECT;
  }, [permissionMatrix]);

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath, user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      const token = response?.data?.token;
      if (!token) {
        throw new Error("Login failed: token missing.");
      }

      localStorage.setItem("authToken", token);
      await refreshSession();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || apiError.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <h1>Smart Institute AI</h1>
        <p>Sign in to continue to your workspace.</p>

        <form className="ui-form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@celeris.com"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="ui-error-text">{error}</p> : null}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
