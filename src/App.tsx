import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import Index from "./spa-pages/Index";
import Login from "./spa-pages/Login";
import Register from "./spa-pages/Register";
import VerifyEmail from "./spa-pages/VerifyEmail";
import ForgotPassword from "./spa-pages/ForgotPassword";
import ConfirmPassword from "./spa-pages/ConfirmPassword";
import Dashboard from "./spa-pages/Dashboard";
import Reports from "./spa-pages/ReportsNew";
import Invoices from "./spa-pages/Invoices";
import Newsletter from "./spa-pages/Newsletter";
import EmailLists from "./spa-pages/EmailLists";
import Settings from "./spa-pages/Settings";
import Organization from "./spa-pages/Organization";
import OrganizationSettings from "./spa-pages/OrganizationSettings";
import Clients from "./spa-pages/Clients";
import Integration from "./spa-pages/Integration";
import Health from "./spa-pages/Health";
import Unauthorized from "./spa-pages/Unauthorized";
import NotFound from "./spa-pages/NotFound";
import AccountingAI from "./spa-pages/AccountingAI";
import SharedReportView from "./spa-pages/SharedReportView";
import DashboardPrecision from "./spa-pages/DashboardPrecision";
import DashboardEditorial from "./spa-pages/DashboardEditorial";
import DashboardCanvas from "./spa-pages/DashboardCanvas";
import DashboardGuidance from "./spa-pages/DashboardGuidance";
import DashboardModern from "./spa-pages/DashboardModern";
import AnalyticsModern from "./spa-pages/AnalyticsModern";
import { useEffect } from "react";
import { isShowcaseMode } from "@/lib/showcaseMode";

const queryClient = new QueryClient();

const App = () => {
  // i18next browser detector touches `document`/`localStorage` so keep it strictly client-side.
  useEffect(() => {
    import("./lib/i18n");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <OrganizationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {!isShowcaseMode() && <FloatingChatWidget />}
              {isShowcaseMode() ? (
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard-canvas" replace />} />
                <Route
                  path="/dashboard-canvas"
                  element={
                    <ProtectedRoute>
                      <DashboardCanvas />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard-canvas" replace />} />
              </Routes>
              ) : (
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/confirm-password" element={<ConfirmPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/server-health" element={<Health />} />
              <Route
                path="/shared-report/:token"
                element={<SharedReportView />}
              />

              {/* Protected routes - require authentication */}
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

              {/* Reports - available to all authenticated users */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Invoices - managers and admins only */}
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Invoices />
                  </ProtectedRoute>
                }
              />

              {/* Newsletter - managers and admins only */}
              <Route
                path="/newsletter"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Newsletter />
                  </ProtectedRoute>
                }
              />

              {/* Accounting AI - available to all authenticated users for now */}
              <Route
                path="/accounting-ai"
                element={
                  <ProtectedRoute>
                    <AccountingAI />
                  </ProtectedRoute>
                }
              />

              {/* Email Lists - managers and admins only */}
              <Route
                path="/email-lists"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <EmailLists />
                  </ProtectedRoute>
                }
              />

              {/* Clients - managers and admins only */}
              <Route
                path="/clients"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Clients />
                  </ProtectedRoute>
                }
              />

              {/* Settings - owners only */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Organization - admins only */}
              <Route
                path="/organization"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <Organization />
                  </ProtectedRoute>
                }
              />

              {/* Organization Settings - admins only */}
              <Route
                path="/organization-settings"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <OrganizationSettings />
                  </ProtectedRoute>
                }
              />

              {/* Integration - admins only */}
              <Route
                path="/integration"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <Integration />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Variants */}
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

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
              )}
            </TooltipProvider>
          </OrganizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
