/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    'node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx,vue}',
    'node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#060511',
          900: '#060511',
          950: '#060511',
        },
        slate: {
          50: '#f8f7ff',
          100: '#f0eeff', 
          200: '#e1ddff',
          300: '#cfc8ff',
          400: '#b8aeff',
          500: '#9d8fff',
          600: '#7c3aed',
          700: '#6b21a8',
          800: '#060511',
          900: '#060511',
          950: '#060511',
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #020617 0%, #0f172a 25%, #1e1b4b 50%, #312e81 75%, #1e293b 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(49, 46, 129, 0.6) 100%)',
        'gradient-super-dark': 'linear-gradient(135deg, rgba(2, 6, 23, 0.95) 0%, rgba(15, 23, 42, 0.9) 25%, rgba(30, 27, 75, 0.8) 50%, rgba(49, 46, 129, 0.7) 75%, rgba(30, 41, 59, 0.85) 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #020617 0%, #0f172a 20%, #1e1b4b 40%, #312e81 60%, #1e293b 80%, #0f172a 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'sm': '0.75rem',
        DEFAULT: '0.75rem',
        'md': '0.75rem',
        'lg': '0.75rem',
        'xl': '0.75rem',
        '2xl': '0.75rem',
        '3xl': '0.75rem',
        'full': '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
    container: {
      padding: "2rem",
      center: true,
    },
  },
  variants: {
    extend: {
      flex: ['responsive'],
      gridTemplateColumns: ['responsive'],
      backdropBlur: ['hover'],
    },
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/aspect-ratio')
  ],
}

