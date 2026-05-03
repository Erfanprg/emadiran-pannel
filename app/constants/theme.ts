// Color palette utilities and constants
export const colors = {
  // Primary colors - Emad Brand
  primary: '#0f3057',
  secondary: '#008891',
  accent: '#00587a',

  // Blue dark variants (kept for compatibility)
  blueDark: {
    DEFAULT: '#0f3057',
    600: '#0f3057',
    700: '#0a2240',
  },

  // Blue light variants (secondary shades)
  blueLight: {
    DEFAULT: '#008891',
    400: '#00a8b3',
    300: '#00c8d4',
  },

  // Light theme grayscale
  black: '#1a1a1a',
  gray: {
    DEFAULT: '#6B7280',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
} as const;

// Border radius utilities
export const borderRadius = {
  DEFAULT: '8px',
  full: '999px',
} as const;

// Common component styles
export const styles = {
  button: {
    primary: 'bg-primary hover:bg-blue-dark text-white px-6 py-3 rounded font-medium transition-colors duration-200',
    secondary: 'bg-blue-light hover:bg-blue-light-300 text-blue-dark-700 px-6 py-3 rounded font-medium transition-colors duration-200',
    outline: 'border-2 border-primary hover:bg-primary hover:text-white text-primary px-6 py-3 rounded font-medium transition-colors duration-200',
  },
  card: {
    default: 'bg-white rounded shadow-sm border border-gray-200 p-6',
    elevated: 'bg-white rounded-lg shadow-md border border-gray-100 p-6',
  },
  input: {
    default: 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900',
  }
} as const;

// Type definitions for TypeScript support
export type ColorKey = keyof typeof colors;
export type BorderRadiusKey = keyof typeof borderRadius;