import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WMA Blues
        primary: {
          900: "#0D1B4B",
          800: "#1B2E6B",
          700: "#1A3A8F",
          600: "#1565C0",
          500: "#1976D2",
          400: "#42A5F5",
          300: "#4DB8E8",
          100: "#E3F2FD",
          DEFAULT: "#1976D2",
          foreground: "#FFFFFF",
        },
        // Chula Pink
        chula: {
          700: "#880E4F",
          500: "#C2185B",
          300: "#E91E8C",
          100: "#FCE4EC",
          DEFAULT: "#C2185B",
          foreground: "#FFFFFF",
        },
        // Water Quality Status
        quality: {
          excellent: "#43A047",
          good: "#8BC34A",
          fair: "#FFC107",
          poor: "#FF7043",
          critical: "#E53935",
        },
        // Neutrals
        surface: "#F5F7FA",
        border: "#E0E7EF",
        "text-primary": "#1A237E",
        "text-secondary": "#546E7A",
        // shadcn compat
        background: "#F5F7FA",
        foreground: "#1A237E",
        card: { DEFAULT: "#FFFFFF", foreground: "#1A237E" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#1A237E" },
        secondary: { DEFAULT: "#E3F2FD", foreground: "#1565C0" },
        muted: { DEFAULT: "#F5F7FA", foreground: "#546E7A" },
        accent: { DEFAULT: "#FCE4EC", foreground: "#C2185B" },
        destructive: { DEFAULT: "#E53935", foreground: "#FFFFFF" },
        input: "#E0E7EF",
        ring: "#1976D2",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-thai)", "sans-serif"],
        thai: ["var(--font-noto-sans-thai)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-25px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        wave: "wave 6s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
