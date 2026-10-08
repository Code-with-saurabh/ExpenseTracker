/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--card)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        line: 'var(--border)',
        primary: 'var(--primary)',
        primaryhover: 'var(--primary-hover)',
        onprimary: 'var(--primary-text)',
        accent: 'var(--accent)',
        sage: 'var(--sage)',
        beige: 'var(--beige)',
        rowhover: 'var(--hover)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 4px 16px rgba(41, 35, 31, 0.08)',
        lift: '0 8px 24px rgba(41, 35, 31, 0.12)',
      },
    },
  },
  plugins: [],
};
