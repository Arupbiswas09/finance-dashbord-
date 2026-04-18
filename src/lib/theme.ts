/**
 * Theme utility functions for organization-based theming
 */

/**
 * Convert hex color to HSL format (for Tailwind CSS)
 * @param hex - Hex color string (e.g., "#3B4A7A" or "3B4A7A")
 * @returns HSL string in format "h s% l%" (e.g., "218 45% 18%")
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Validate hex color
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    console.warn(`Invalid hex color: ${hex}, using default`);
    return '218 45% 18%'; // Default dark blue
  }
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Find min and max
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Lighten a color by adjusting lightness
 * @param hsl - HSL string in format "h s% l%"
 * @param amount - Amount to lighten (0-100, default 10)
 * @returns Lightened HSL string
 */
export function lightenHsl(hsl: string, amount: number = 10): string {
  const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return hsl;
  
  const [, h, s, l] = match;
  const newL = Math.min(100, parseInt(l) + amount);
  return `${h} ${s}% ${newL}%`;
}

/**
 * Darken a color by adjusting lightness
 * @param hsl - HSL string in format "h s% l%"
 * @param amount - Amount to darken (0-100, default 10)
 * @returns Darkened HSL string
 */
export function darkenHsl(hsl: string, amount: number = 10): string {
  const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return hsl;
  
  const [, h, s, l] = match;
  const newL = Math.max(0, parseInt(l) - amount);
  return `${h} ${s}% ${newL}%`;
}

/**
 * Get computed foreground color (white or black) based on background brightness
 * @param hex - Hex color string
 * @returns "#ffffff" or "#000000"
 */
export function getForegroundColor(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Get inline style object for theme color
 * @param color - Hex color string
 * @returns React.CSSProperties object
 */
export function getThemeStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: color,
    color: getForegroundColor(color),
  };
}

/**
 * Convert HSL string back to hex (simplified - for gradients we'll use opacity)
 * Helper to create hex with opacity
 */
function hexWithOpacity(hex: string, opacity: number): string {
  // For gradients, we'll use rgba format
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Create gradient string using theme colors
 * @param primary - Primary hex color
 * @param secondary - Secondary hex color (optional, uses primary variants if not provided)
 * @param direction - Gradient direction (default: "135deg")
 * @returns CSS gradient string
 */
export function createThemeGradient(
  primary: string,
  secondary?: string,
  direction: string = '135deg'
): string {
  if (secondary) {
    const primaryHsl = hexToHsl(primary);
    const darkPrimary = darkenHsl(primaryHsl, 20);
    // Convert dark HSL back to approximate hex for gradient
    return `linear-gradient(${direction}, ${primary} 0%, ${secondary} 50%, ${hexWithOpacity(primary, 0.8)} 100%)`;
  }
  
  // Create gradient using primary color with varying opacity
  return `linear-gradient(${direction}, ${primary} 0%, ${hexWithOpacity(primary, 0.85)} 50%, ${hexWithOpacity(primary, 0.7)} 100%)`;
}

/**
 * Get Tailwind-compatible color classes
 * @param type - 'primary' or 'secondary'
 * @returns Object with Tailwind class names
 */
export function getThemeClasses(type: 'primary' | 'secondary') {
  return {
    bg: `bg-org-${type}`,
    text: `text-org-${type}`,
    border: `border-org-${type}`,
    hover: `hover:bg-org-${type}-dark`,
  };
}

