"use client";

import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import ShowcaseRoutes from "@/ShowcaseRoutes";
import { isShowcaseMode } from "@/lib/showcaseMode";

const FullRoutes = lazy(() => import("@/FullRoutes"));

const queryClient = new QueryClient();

const routeFallback = (
  <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] text-slate-600 dark:bg-[#09090b] dark:text-slate-400">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-slate-800 dark:border-white" />
  </div>
);

const App = () => {
  useEffect(() => {
    void import("./lib/i18n");
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
              <FloatingChatWidget />
              {isShowcaseMode() ? (
                <ShowcaseRoutes />
              ) : (
                <Suspense fallback={routeFallback}>
                  <FullRoutes />
                </Suspense>
              )}
            </TooltipProvider>
          </OrganizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
