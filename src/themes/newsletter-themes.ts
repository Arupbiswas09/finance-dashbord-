/**
 * Premium Newsletter Theme Definitions
 * Modern SaaS + Editorial + Finance styles
 */

export interface NewsletterTheme {
    id: string;
    name: string;
    description: string;
    preview: {
      primary: string;
      secondary: string;
      background: string;
    };
    colors: {
      primary: string;
      secondary: string;
      background: string;
      headerBg: string;
      footerBg: string;
      textHeading: string;
      textBody: string;
      textMuted: string;
      cardBg: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      headerStyle: 'dark' | 'light' | 'gradient';
      footerStyle: 'dark' | 'light';
      cardStyle: 'rounded' | 'sharp' | 'elevated';
      spacing: 'compact' | 'normal' | 'spacious';
    };
  }
  
  export const newsletterThemes: NewsletterTheme[] = [
    /**
     * 1. Smart Accounting (Dark blue header/footer with orange accents - Professional and modern)
     */
    {
      id: 'smart-accounting',
      name: 'Smart Accounting',
      description: 'Dark blue header/footer with orange accents - Professional and modern design matching Smart Accounting branding',
      preview: {
        primary: '#1e293b',
        secondary: '#f97316',
        background: '#ffffff',
      },
      colors: {
        primary: '#1e293b',        // Dark blue/black
        secondary: '#f97316',      // Orange
        background: '#f9fafb',    // Light grey
        headerBg: '#1e293b',       // Dark blue/black
        footerBg: '#1e293b',       // Dark blue/black
        textHeading: '#000000',    // Black (for headings in content sections)
        textBody: '#1f2937',       // Dark gray (on light backgrounds)
        textMuted: '#6b7280',      // Gray
        cardBg: '#ffffff',         // White
        border: '#e5e7eb',         // Light gray
      },
      fonts: {
        heading: 'Arial, sans-serif',
        body: 'Arial, sans-serif',
      },
      layout: {
        headerStyle: 'dark',
        footerStyle: 'dark',
        cardStyle: 'rounded',
        spacing: 'normal',
      },
    },
  
    /**
     * 2. Executive Gold (Luxury finance, wealth management)
     */
    {
      id: 'executive-gold',
      name: 'Executive Gold',
      description: 'Black + champagne gold for premium financial communication.',
      preview: {
        primary: '#111827',
        secondary: '#d4af37',
        background: '#f5f5f4',
      },
      colors: {
        primary: '#111827',     // Charcoal black
        secondary: '#d4af37',   // Gold
        background: '#f5f5f4',  // Warm off-white
        headerBg: '#111827',
        footerBg: '#111827',
        textHeading: '#d4af37',
        textBody: '#1f2937',
        textMuted: '#6b7280',
        cardBg: '#ffffff',
        border: '#e5e7eb',
      },
      fonts: {
        heading: 'Playfair Display, serif',
        body: 'Inter, sans-serif',
      },
      layout: {
        headerStyle: 'dark',
        footerStyle: 'dark',
        cardStyle: 'sharp',
        spacing: 'normal',
      },
    },
  
    /**
     * 3. Clean Professional (Corporate with clean whites + blues)
     */
    {
      id: 'clean-professional',
      name: 'Clean Professional',
      description: 'Light, ultra-clean corporate style with clarity-first design.',
      preview: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        background: '#f9fafb',
      },
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        background: '#f9fafb',
        headerBg: '#ffffff',
        footerBg: '#1e40af',
        textHeading: '#1e40af',
        textBody: '#1f2937',
        textMuted: '#6b7280',
        cardBg: '#ffffff',
        border: '#e5e7eb',
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
      },
      layout: {
        headerStyle: 'light',
        footerStyle: 'dark',
        cardStyle: 'rounded',
        spacing: 'normal',
      },
    },
  
    /**
     * 4. Minimal Editorial (Magazine style)
     */
    {
      id: 'editorial-minimal',
      name: 'Editorial Minimal',
      description: 'Whitespace-rich newspaper/magazine editorial style.',
      preview: {
        primary: '#111111',
        secondary: '#f97316',
        background: '#ffffff',
      },
      colors: {
        primary: '#111111',
        secondary: '#f97316',
        background: '#ffffff',
        headerBg: '#ffffff',
        footerBg: '#f9fafb',
        textHeading: '#111111',
        textBody: '#2d2d2d',
        textMuted: '#767676',
        cardBg: '#ffffff',
        border: '#eaeaea',
      },
      fonts: {
        heading: 'Merriweather, serif',
        body: 'Inter, sans-serif',
      },
      layout: {
        headerStyle: 'light',
        footerStyle: 'light',
        cardStyle: 'sharp',
        spacing: 'spacious',
      },
    },
  
    /**
     * 5. Midnight Blue (Modern dark theme)
     */
    {
      id: 'midnight-blue',
      name: 'Midnight Blue',
      description: 'Dark UI with professional blue accents for modern SaaS newsletters.',
      preview: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        background: '#0f172a',
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        background: '#0f172a',
        headerBg: '#0f172a',
        footerBg: '#0f172a',
        textHeading: '#ffffff',
        textBody: '#d1d5db',
        textMuted: '#9ca3af',
        cardBg: '#1e293b',
        border: '#334155',
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
      },
      layout: {
        headerStyle: 'dark',
        footerStyle: 'dark',
        cardStyle: 'elevated',
        spacing: 'normal',
      },
    },
  
    /**
     * 6. Citrus Pop (Bright energetic)
     */
    {
      id: 'citrus-pop',
      name: 'Citrus Pop',
      description: 'Energetic newsletter style with citrus gradients.',
      preview: {
        primary: '#f97316',
        secondary: '#facc15',
        background: '#fff7ed',
      },
      colors: {
        primary: '#f97316',
        secondary: '#facc15',
        background: '#fff7ed',
        headerBg: 'linear-gradient(135deg, #f97316, #facc15)',
        footerBg: '#1f2937',
        textHeading: '#1f2937',
        textBody: '#374151',
        textMuted: '#6b7280',
        cardBg: '#ffffff',
        border: '#fcd34d',
      },
      fonts: {
        heading: 'Poppins, sans-serif',
        body: 'Inter, sans-serif',
      },
      layout: {
        headerStyle: 'gradient',
        footerStyle: 'dark',
        cardStyle: 'rounded',
        spacing: 'spacious',
      },
    },
  ];
  
  export const getThemeById = (id: string): NewsletterTheme | undefined => {
    return newsletterThemes.find(theme => theme.id === id);
  };
  
  export const getDefaultTheme = (): NewsletterTheme => {
    return newsletterThemes[0];
  };
  