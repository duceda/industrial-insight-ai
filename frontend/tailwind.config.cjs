module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#050b14',
          900: '#0b1220',
          800: '#101b2a',
          700: '#16314a',
          600: '#1e4a67',
          500: '#2d6f8c',
        },
      },
      boxShadow: {
        panel: '0 24px 60px rgba(2, 6, 23, 0.28)',
        glow: '0 0 0 1px rgba(148, 163, 184, 0.15)',
      },
    },
  },
  plugins: [],
}
