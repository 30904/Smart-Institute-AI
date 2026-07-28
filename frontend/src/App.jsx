import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "@/layout/AppLayout";
import academicRoutes from "@/routes/academicRoutes";
import coreRoutes from "@/routes/coreRoutes";

function App() {
  const loginRoute = coreRoutes.find((route) => route.path === "/login");
  const protectedRoutes = [...coreRoutes.filter((route) => route.path !== "/login"), ...academicRoutes];
  const LoginComponent = loginRoute?.element;

  return (
    <BrowserRouter>
      <Suspense fallback={<main className="app-shell">Loading...</main>}>
        <Routes>
          {loginRoute && LoginComponent ? <Route path={loginRoute.path} element={<LoginComponent />} /> : null}
          <Route element={<AppLayout />}>
            {protectedRoutes.map((route) => {
              const RouteComponent = route.element;
              return <Route key={route.path} path={route.path} element={<RouteComponent />} />;
            })}
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
