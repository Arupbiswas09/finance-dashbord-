import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import Index from "@/spa-pages/Index";
import Login from "@/spa-pages/Login";
import Register from "@/spa-pages/Register";
import VerifyEmail from "@/spa-pages/VerifyEmail";
import ForgotPassword from "@/spa-pages/ForgotPassword";
import ConfirmPassword from "@/spa-pages/ConfirmPassword";
import Dashboard from "@/spa-pages/Dashboard";
import Reports from "@/spa-pages/ReportsNew";
import Invoices from "@/spa-pages/Invoices";
import Newsletter from "@/spa-pages/Newsletter";
import EmailLists from "@/spa-pages/EmailLists";
import Settings from "@/spa-pages/Settings";
import Organization from "@/spa-pages/Organization";
import OrganizationSettings from "@/spa-pages/OrganizationSettings";
import Clients from "@/spa-pages/Clients";
import Integration from "@/spa-pages/Integration";
import Health from "@/spa-pages/Health";
import Unauthorized from "@/spa-pages/Unauthorized";
import NotFound from "@/spa-pages/NotFound";
import AccountingAI from "@/spa-pages/AccountingAI";
import SharedReportView from "@/spa-pages/SharedReportView";
import DashboardPrecision from "@/spa-pages/DashboardPrecision";
import DashboardEditorial from "@/spa-pages/DashboardEditorial";
import DashboardCanvas from "@/spa-pages/DashboardCanvas";
import DashboardGuidance from "@/spa-pages/DashboardGuidance";
import DashboardModern from "@/spa-pages/DashboardModern";
import AnalyticsModern from "@/spa-pages/AnalyticsModern";

export default function FullRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/confirm-password" element={<ConfirmPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/server-health" element={<Health />} />
      <Route path="/shared-report/:token" element={<SharedReportView />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute>
              <Dashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute requiredRoles={["admin", "manager"]}>
            <Invoices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/newsletter"
        element={
          <ProtectedRoute requiredRoles={["admin", "manager"]}>
            <Newsletter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/accounting-ai"
        element={
          <ProtectedRoute>
            <AccountingAI />
          </ProtectedRoute>
        }
      />

      <Route
        path="/email-lists"
        element={
          <ProtectedRoute requiredRoles={["admin", "manager"]}>
            <EmailLists />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute requiredRoles={["admin", "manager"]}>
            <Clients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <Organization />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization-settings"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <OrganizationSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/integration"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <Integration />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard-precision"
        element={
          <ProtectedRoute>
            <DashboardPrecision />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-editorial"
        element={
          <ProtectedRoute>
            <DashboardEditorial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-canvas"
        element={
          <ProtectedRoute>
            <DashboardCanvas />
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
