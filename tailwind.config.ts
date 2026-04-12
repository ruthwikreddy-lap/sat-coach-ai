import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        teal: {
          DEFAULT: "hsl(var(--teal))",
          light: "hsl(var(--teal-light))",
          foreground: "hsl(var(--teal-foreground))",
        },
        amber: {
          DEFAULT: "hsl(var(--amber))",
          light: "hsl(var(--amber-light))",
          foreground: "hsl(var(--amber-foreground))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          light: "hsl(var(--navy-light))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          light: "hsl(var(--success-light))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          light: "hsl(var(--danger-light))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glass-shine": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        "parallax-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-30px)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
        "gradient-y": {
          "0%, 100%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "0% 100%",
          },
        },
        "particle-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.3" },
          "25%": { transform: "translate(10px, -10px) scale(1.1)", opacity: "0.5" },
          "50%": { transform: "translate(-5px, -20px) scale(1)", opacity: "0.4" },
          "75%": { transform: "translate(-15px, -5px) scale(1.05)", opacity: "0.5" },
        },
        "reveal-up": {
          "from": { opacity: "0", transform: "translateY(40px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-scale": {
          "from": { opacity: "0", transform: "scale(0.9)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
        "magnetic-pull": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(2px, -2px)" },
          "50%": { transform: "translate(-1px, 1px)" },
          "75%": { transform: "translate(1px, -1px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 255, 255, 0.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 7s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "glass-shine": "glass-shine 3s ease-in-out infinite",
        "parallax-slow": "parallax-slow 10s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "particle-float": "particle-float 20s ease-in-out infinite",
        "reveal-up": "reveal-up 0.8s ease-out",
        "reveal-scale": "reveal-scale 0.6s ease-out",
        "magnetic-pull": "magnetic-pull 0.3s ease-in-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
