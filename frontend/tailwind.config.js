/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:             'rgb(var(--rgb-bg)           / <alpha-value>)',
        surface:        'rgb(var(--rgb-surface)      / <alpha-value>)',
        card:           'rgb(var(--rgb-card)         / <alpha-value>)',
        border:         'rgb(var(--rgb-border)       / <alpha-value>)',
        primary:        'rgb(var(--rgb-primary)      / <alpha-value>)',
        'primary-dark': 'rgb(var(--rgb-primary-dark) / <alpha-value>)',
        'primary-fg':   'rgb(var(--rgb-primary-fg)   / <alpha-value>)',
        success:        'rgb(var(--rgb-success)      / <alpha-value>)',
        danger:         'rgb(var(--rgb-danger)       / <alpha-value>)',
        warning:        'rgb(var(--rgb-warning)      / <alpha-value>)',
        'text-primary':   'rgb(var(--rgb-text-primary)   / <alpha-value>)',
        'text-secondary': 'rgb(var(--rgb-text-secondary) / <alpha-value>)',
        'text-muted':     'rgb(var(--rgb-text-muted)     / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
