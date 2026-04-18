import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // true = require auth, false = require no auth (for login/register)
}

export const AuthGuard = ({ 
  children, 
  redirectTo = '/dashboard-modern', 
  requireAuth = false 
}: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User needs to be authenticated but isn't
        navigate('/login', { replace: true });
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be (on login/register page)
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, loading, navigate, redirectTo, requireAuth]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show content based on auth requirements
  if (requireAuth && !user) {
    return null; // Will redirect to login
  }
  
  if (!requireAuth && user) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
};