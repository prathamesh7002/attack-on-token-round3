/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        surface: {
          DEFAULT: '#FFFFFF',
          border: '#E7E5E0',
        },
        text: {
          primary: '#1C1917',
          muted: '#6B6560',
        },
        action: {
          primary: '#1C1917',
          hover: '#3A3532',
        },
        accent: {
          DEFAULT: '#D9480F',
          hover: '#BF3F0D',
        },
        status: {
          safe: '#2F9E44',
          'safe-bg': '#EBF7ED',
          warning: '#E8A317',
          'warning-bg': '#FDF5E1',
          high: '#E8590C',
          'high-bg': '#FDEEE5',
          exceeded: '#C92A2A',
          'exceeded-bg': '#FBEAEA',
          neutral: '#6B6560',
          'neutral-bg': '#F2F1EE',
        },
        category: {
          ingredients: '#2B6CB0',
          vegetables: '#2F9E44',
          oil: '#D9480F',
          fuel: '#E8590C',
          packaging: '#7950F2',
          transport: '#0CA678',
          rent: '#495057',
          cleaning: '#1098AD',
          equipment: '#D6336C',
          misc: '#868E96',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
