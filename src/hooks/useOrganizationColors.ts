import { useOrganization } from '@/contexts/OrganizationContext';

interface OrganizationColors {
  primary: string;
  secondary: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to access organization colors.
 * @deprecated This hook is now a wrapper around OrganizationContext.
 * Consider using useOrganization() directly for better performance.
 */
export const useOrganizationColors = (): OrganizationColors => {
  const organization = useOrganization();
  
  return {
    primary: '#0a0021',
    secondary: '#fe7710',
    loading: organization.loading,
    error: organization.error,
    refresh: organization.refresh,
  };
};
