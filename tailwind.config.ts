import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        navy: {
          50: "#EAF0F8",
          100: "#CFDDEE",
          200: "#9FBBDD",
          300: "#6E97C9",
          400: "#4A78AF",
          500: "#2B5D93",
          600: "#1F4A78",
          700: "#173A60",
          800: "#122C4A",
          900: "#0B2545", // marca — predominante
          950: "#071729",
        },
        green: {
          50: "#E7F7EF",
          100: "#C3ECD8",
          200: "#8FDAB4",
          300: "#57C38C",
          400: "#2FAE72",
          500: "#1F9D6B", // marca
          600: "#178256",
          700: "#126746",
          800: "#0E4F37",
          900: "#0A3A29",
        },
        orange: {
          50: "#FDF1E7",
          100: "#FBDEC0",
          200: "#F7C08A",
          300: "#F3A055",
          400: "#F0872F", // marca
          500: "#E27A24",
          600: "#C1651B",
          700: "#994F16",
          800: "#733B10",
          900: "#4F290B",
        },
        charcoal: {
          950: "#14171C",
          900: "#191D24",
          850: "#1E232B",
          800: "#242A33",
          700: "#2E3540",
          600: "#3B4451",
          500: "#4E5866",
          400: "#6B7684",
        },
        cream: {
          50: "#FFFFFF",
          100: "#F8F8F5",
          150: "#F2F2ED",
          200: "#E9E9E2",
          300: "#DCDCD3",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,37,69,0.06), 0 1px 3px rgba(11,37,69,0.08)",
        card: "0 2px 8px rgba(11,37,69,0.06), 0 1px 2px rgba(11,37,69,0.04)",
        lift: "0 8px 24px rgba(11,37,69,0.12), 0 2px 6px rgba(11,37,69,0.06)",
        "dark-card": "0 2px 8px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 currentColor" },
          "70%": { boxShadow: "0 0 0 6px transparent" },
          "100%": { boxShadow: "0 0 0 0 transparent" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fade-up 0.35s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
