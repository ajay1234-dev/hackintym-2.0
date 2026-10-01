import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        vintage: ["'Outfit'", "serif"],
      },
      colors: {
        background: "#07090e",
        foreground: "#f8fafc",
        cyber: {
          dark: "#05070c",
          darker: "#030408",
          card: "#0b0f19",
          cardHover: "#121829",
          border: "#1e293b",
          borderLight: "#334155",
          red: "#ff2a5f",
          redGlow: "#ff003c",
          blue: "#00d2ff",
          blueGlow: "#0070f3",
          gold: "#ffd700",
          silver: "#e2e8f0",
          bronze: "#cd7f32",
          muted: "#94a3b8",
        },
      },
      boxShadow: {
        "neon-red": "0 0 15px rgba(255, 42, 95, 0.45), 0 0 30px rgba(255, 42, 95, 0.2)",
        "neon-blue": "0 0 15px rgba(0, 210, 255, 0.45), 0 0 30px rgba(0, 210, 255, 0.2)",
        "neon-dual": "0 0 20px rgba(255, 42, 95, 0.3), 0 0 30px rgba(0, 210, 255, 0.3)",
        "neon-gold": "0 0 20px rgba(255, 215, 0, 0.45), 0 0 40px rgba(255, 215, 0, 0.2)",
        "cyber-card": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "flip-card": "0 4px 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "cyber-dots": "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)",
      },
      animation: {
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-red": "glowRed 3s ease-in-out infinite alternate",
        "glow-blue": "glowBlue 3s ease-in-out infinite alternate",
        "float": "float 4s ease-in-out infinite",
        "flip-top": "flipTop 0.3s ease-in forwards",
        "flip-bottom": "flipBottom 0.3s ease-out forwards",
      },
      keyframes: {
        glowRed: {
          "0%": { boxShadow: "0 0 10px rgba(255, 42, 95, 0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(255, 42, 95, 0.7), 0 0 40px rgba(255, 42, 95, 0.3)" },
        },
        glowBlue: {
          "0%": { boxShadow: "0 0 10px rgba(0, 210, 255, 0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 210, 255, 0.7), 0 0 40px rgba(0, 210, 255, 0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        flipTop: {
          "0%": { transform: "rotateX(0deg)", transformOrigin: "bottom center" },
          "100%": { transform: "rotateX(-90deg)", transformOrigin: "bottom center" },
        },
        flipBottom: {
          "0%": { transform: "rotateX(90deg)", transformOrigin: "top center" },
          "100%": { transform: "rotateX(0deg)", transformOrigin: "top center" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
