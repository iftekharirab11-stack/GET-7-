import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        "accent-cyan": "var(--accent-cyan)",
        "accent-purple": "var(--accent-purple)",
        "accent-red": "var(--accent-red)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      animation: {
        glitch: "glitch 2s infinite",
        "pulse-neon": "pulse-neon 2s infinite",
      },
      keyframes: {
        glitch: {
          "0%": { textShadow: "0 0 5px var(--accent-cyan), 0 0 10px var(--accent-cyan)" },
          "25%": { textShadow: "-2px 0 0 var(--accent-purple), 2px 0 0 var(--accent-cyan)" },
          "50%": { textShadow: "2px 0 0 var(--accent-purple), -2px 0 0 var(--accent-cyan)" },
          "75%": { textShadow: "-2px 0 0 var(--accent-purple), 2px 0 0 var(--accent-cyan)" },
          "100%": { textShadow: "0 0 5px var(--accent-cyan), 0 0 10px var(--accent-cyan)" },
        },
        "pulse-neon": {
          "0%, 100%": { boxShadow: "0 0 5px var(--accent-cyan)" },
          "50%": { boxShadow: "0 0 20px var(--accent-cyan), 0 0 30px var(--accent-cyan)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;