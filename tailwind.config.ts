import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#07080b",
          900: "#050608",
          800: "#0a0c12",
          700: "#10141d",
          600: "#1a1f2b",
        },
        hazard: {
          orange: "#ff6a00",
          crimson: "#ff1a3a",
          amber: "#ffb400",
          toxic: "#f2ff00",
        },
        neon: {
          green: "#00ff94",
          cyan: "#00f0ff",
          violet: "#9b4dff",
        },
        border: "#1e2533",
        muted: "#7a8194",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hazard': '0 0 30px rgba(255,106,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
        'neon': '0 0 20px rgba(0,255,148,0.15)',
        'crimson': '0 0 24px rgba(255,26,58,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0,255,148,0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(0,255,148,0.35)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
