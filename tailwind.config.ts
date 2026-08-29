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
        navy: {
          900: "#0b1329",
          800: "#111c38",
          700: "#1a294d",
          600: "#253866",
        },
        cyanAccent: {
          500: "#00f2fe",
          600: "#4facfe",
        }
      },
    },
  },
  plugins: [],
};
export default config;
