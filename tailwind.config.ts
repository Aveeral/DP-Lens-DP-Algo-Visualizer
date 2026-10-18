import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        source: 'var(--source)',
        'source-soft': 'var(--source-soft)',
        win: 'var(--win)',
        'win-soft': 'var(--win-soft)',
        lose: 'var(--lose)',
        error: 'var(--error)',
        'error-soft': 'var(--error-soft)',
        path: 'var(--path)',
        'path-soft': 'var(--path-soft)',
        base: 'var(--base)',
        'dup-1': 'var(--dup-1)',
        'dup-2': 'var(--dup-2)',
        'dup-3': 'var(--dup-3)',
        'dup-4': 'var(--dup-4)',
        'dup-5': 'var(--dup-5)',
        'dup-6': 'var(--dup-6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        float: 'var(--shadow-float)',
      },
      borderRadius: {
        cell: '6px',
        control: '8px',
        panel: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
