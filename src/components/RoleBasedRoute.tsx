import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { isShowcaseMode } from '@/lib/showcaseMode';

interface RoleBasedRouteProps {
  children: React.ReactNode;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isShowcaseMode()) return;
    if (!loading && isAuthenticated && user?.role) {
      const onHomeDashboard =
        location.pathname === "/dashboard" || location.pathname === "/dashboard-modern";
      if (!onHomeDashboard) return;
      const roleBasedPath = getRoleBasedPath(user.role.name);
      if (roleBasedPath !== location.pathname) {
        navigate(roleBasedPath, { replace: true });
      }
    }
  }, [user, loading, isAuthenticated, location.pathname, navigate]);

  const getRoleBasedPath = (roleName: string): string => {
    switch (roleName) {
      case "admin":
        return "/dashboard-modern";
      case "manager":
        return "/reports";
      case "viewer":
        return "/reports";
      default:
        return "/dashboard-modern";
    }
  };

  if (!isShowcaseMode() && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRoute;