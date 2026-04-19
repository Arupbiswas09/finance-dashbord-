import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardModern from "@/spa-pages/DashboardModern";
import AnalyticsModern from "@/spa-pages/AnalyticsModern";
import DashboardGuidance from "@/spa-pages/DashboardGuidance";

/**
 * Vercel / demo hub: only the three theme dashboards — no Index, login, or other app routes.
 */
export default function ShowcaseRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard-modern" replace />} />
      <Route
        path="/dashboard-modern"
        element={
          <ProtectedRoute>
            <DashboardModern />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics-modern"
        element={
          <ProtectedRoute>
            <AnalyticsModern />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-guidance"
        element={
          <ProtectedRoute>
            <DashboardGuidance />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard-modern" replace />} />
    </Routes>
  );
}
