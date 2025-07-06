import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace'],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      dark: {
        colors: {
          background: "#0d1117",
          foreground: "#e6edf3",
          primary: {
            50: "#e6f1fe",
            100: "#cce3fd",
            200: "#99c7fb",
            300: "#66aaf9",
            400: "#338ef7",
            500: "#006fee",
            600: "#005bc4",
            700: "#004493",
            800: "#002e62",
            900: "#001731",
            DEFAULT: "#006fee",
            foreground: "#ffffff",
          },
          secondary: {
            50: "#f2f2f3",
            100: "#e6e6e7",
            200: "#ccccce",
            300: "#b3b3b6",
            400: "#99999d",
            500: "#808085",
            600: "#66666a",
            700: "#4d4d50",
            800: "#333335",
            900: "#1a1a1b",
            DEFAULT: "#808085",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
};

export default config;
