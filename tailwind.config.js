/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,vue,ts}",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - Emad Brand
        primary: '#0f3057',
        secondary: '#008891',
        accent: '#00587a',
        
        // Blue dark variants (kept for compatibility)
        'blue-dark': {
          DEFAULT: '#0f3057',
          600: '#0f3057',
          700: '#0a2240',
        },
        
        // Blue light variants (secondary shades)
        'blue-light': {
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
      },
      borderRadius: {
        'DEFAULT': '8px',
        'full': '999px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}