/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        background: '#fbf9f8',
        surface: '#ffffff',
        'surface-low': '#f5f3f2',
        'surface-container': '#efedec',
        'surface-high': '#e9e8e7',
        primary: '#000101',
        'on-primary': '#ffffff',
        muted: '#444748',
        outline: '#747878',
        'outline-soft': '#c4c7c7',
        secondary: '#775a19',
        'secondary-container': '#fdd587',
        'on-secondary-container': '#785a19',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '0.25rem',
      },
      maxWidth: {
        phone: '390px',
      },
    },
  },
  plugins: [],
}
