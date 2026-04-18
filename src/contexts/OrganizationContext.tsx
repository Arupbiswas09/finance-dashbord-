import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useAuth, axiosAuth } from '@/contexts/AuthContext';
import { hexToHsl, lightenHsl, darkenHsl, getForegroundColor } from '@/lib/theme';
import { isShowcaseMode } from '@/lib/showcaseMode';

interface OrganizationTheme {
  primary: string;
  secondary: string;
  logo_url: string | null;
  loading: boolean;
  error: string | null;
}

interface OrganizationContextType {
  primary: string;
  secondary: string;
  logo_url: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Static default organization colors used globally across the app
const DEFAULT_PRIMARY = '#192743'; // Default dark purple
const DEFAULT_SECONDARY = '#fe7710'; // Default orange/coral

const applyColorsToCSS = () => {
  const primaryColor = DEFAULT_PRIMARY;
  const secondaryColor = DEFAULT_SECONDARY;

  // Convert to HSL for Tailwind compatibility
  const primaryHsl = hexToHsl(primaryColor);
  const secondaryHsl = hexToHsl(secondaryColor);
  
  // Get foreground colors
  const primaryForeground = getForegroundColor(primaryColor);
  const secondaryForeground = getForegroundColor(secondaryColor);

  // Set CSS variables in HSL format (for Tailwind)
  document.documentElement.style.setProperty('--org-primary', primaryHsl);
  document.documentElement.style.setProperty('--org-primary-foreground', hexToHsl(primaryForeground));
  document.documentElement.style.setProperty('--org-primary-light', lightenHsl(primaryHsl, 15));
  document.documentElement.style.setProperty('--org-primary-dark', darkenHsl(primaryHsl, 15));
  
  document.documentElement.style.setProperty('--org-secondary', secondaryHsl);
  document.documentElement.style.setProperty('--org-secondary-foreground', hexToHsl(secondaryForeground));
  document.documentElement.style.setProperty('--org-secondary-light', lightenHsl(secondaryHsl, 15));
  document.documentElement.style.setProperty('--org-secondary-dark', darkenHsl(secondaryHsl, 15));

  // Also set hex values for direct use in inline styles
  document.documentElement.style.setProperty('--org-primary-hex', primaryColor);
  document.documentElement.style.setProperty('--org-secondary-hex', secondaryColor);
  
  // Override default primary/secondary to use org colors
  document.documentElement.style.setProperty('--primary', primaryHsl);
  document.documentElement.style.setProperty('--secondary', secondaryHsl);
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  // Initialize with logo from user.organization if available (for immediate display)
  const [theme, setTheme] = useState<OrganizationTheme>({
    primary: DEFAULT_PRIMARY,
    secondary: DEFAULT_SECONDARY,
    logo_url: user?.organization?.logo_url || null,
    loading: !isShowcaseMode(),
    error: null,
  });

  // Apply static organization colors globally once on mount
  useEffect(() => {
    applyColorsToCSS();
  }, []);

  const fetchOrganizationData = useCallback(async () => {
    if (isShowcaseMode()) {
      setTheme((prev) => ({ ...prev, loading: false, error: null }));
      return;
    }
    if (!user?.organization?.id || !isAuthenticated) {
      // If no user or organization, keep defaults
      setTheme(prev => ({
        ...prev,
        loading: false,
      }));
      return;
    }

    try {
      const response = await axiosAuth.get(`/api/organizations/${user.organization.id}`);
      const org = response.data;

      const primaryColor = org.primary_color || '#302160';
      const secondaryColor = org.secondary_color || '#F87171';
      const logoUrl = org.logo_url || null;

      console.log('🎨 OrganizationContext - Fetched organization data:', {
        primary: primaryColor,
        secondary: secondaryColor,
        logo_url: logoUrl,
        org_id: user.organization.id,
      });

      setTheme({
        primary: primaryColor,
        secondary: secondaryColor,
        logo_url: logoUrl,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
      setTheme(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load organization data',
      }));
    }
  }, [user?.organization?.id, isAuthenticated]);

  // Fetch organization data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.organization?.id) {
      fetchOrganizationData();
    } else if (!isAuthenticated) {
      // Reset to defaults when user logs out
      setTheme({
        primary: '#302160',
        secondary: '#F87171',
        logo_url: null,
        loading: false,
        error: null,
      });
    }
  }, [isAuthenticated, user?.organization?.id, fetchOrganizationData]);

  // Listen for custom events to refresh organization data
  useEffect(() => {
    const handleOrganizationUpdate = () => {
      console.log('🔄 OrganizationContext - Organization update event received, refreshing...');
      fetchOrganizationData();
    };
    
    window.addEventListener('organization-colors-updated', handleOrganizationUpdate);
    window.addEventListener('organization-logo-updated', handleOrganizationUpdate);
    window.addEventListener('organization-data-updated', handleOrganizationUpdate);
    
    return () => {
      window.removeEventListener('organization-colors-updated', handleOrganizationUpdate);
      window.removeEventListener('organization-logo-updated', handleOrganizationUpdate);
      window.removeEventListener('organization-data-updated', handleOrganizationUpdate);
    };
  }, [fetchOrganizationData]);

  const value: OrganizationContextType = {
    primary: theme.primary,
    secondary: theme.secondary,
    logo_url: theme.logo_url,
    loading: theme.loading,
    error: theme.error,
    refresh: fetchOrganizationData,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

