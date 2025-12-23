import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bloomberg: {
          orange: '#ff6600',
          black: '#000000',
          dark: '#1a1a1a',
          gray: '#333333',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
