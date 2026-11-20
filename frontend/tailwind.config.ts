import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        shopify: {
          bg: '#f6f6f7',
          surface: '#ffffff',
          border: '#e1e3e5',
          text: '#1a1a1a',
          muted: '#616161',
          subtle: '#8c8c8c',
          dark: '#111111',
          sidebar: '#1a1a1a',
          hover: '#262626',
          green: '#008060',
          'green-light': '#e3f1df',
          blue: '#2c6ecb',
          'blue-light': '#ebf5fa',
          amber: '#b98900',
          'amber-light': '#fdf3d8',
          red: '#de3618',
          'red-light': '#fbeae5',
        },
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc1fb",
          400: "#36a1f8",
          500: "#0c85eb",
          600: "#026ac8",
          700: "#0354a2",
          800: "#074885",
          900: "#0b3c6f",
          950: "#07264a",
        },
      },
      boxShadow: {
        'shopify': '0 1px 0 rgba(0, 0, 0, 0.05)',
        'shopify-card': '0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'shopify-modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
export default config;
