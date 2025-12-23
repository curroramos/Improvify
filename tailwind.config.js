/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Aligned with src/theme/colors.ts
        primary: {
          main: '#6366F1',    // indigo-500
          light: '#818CF8',   // indigo-400
          dark: '#4F46E5',    // indigo-600
        },
        secondary: {
          main: '#8B5CF6',    // violet-500
          light: '#A78BFA',   // violet-400
          dark: '#7C3AED',    // violet-600
        },
        accent: '#10B981',    // emerald-500
        success: '#10B981',   // emerald-500
        warning: '#F59E0B',   // amber-500
        error: '#F43F5E',     // rose-500
        background: '#F8FAFC', // slate-50
        surface: '#FFFFFF',
        text: {
          primary: '#0F172A',  // slate-900
          secondary: '#475569', // slate-600
          muted: '#94A3B8',    // slate-400
        },
      },
    },
  },
  plugins: [],
};
