import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      paper: {
        DEFAULT: "#f4f1ea",
        deep: "#e9e4d8",
      },
      ink: {
        DEFAULT: "#1a1a18",
        60: "rgba(26, 26, 24, 0.6)",
        40: "rgba(26, 26, 24, 0.4)",
        20: "rgba(26, 26, 24, 0.2)",
        10: "rgba(26, 26, 24, 0.1)",
        5: "rgba(26, 26, 24, 0.05)",
      },
      gold: {
        DEFAULT: "#b08d2e",
        bright: "#c9a961",
        15: "rgba(176, 141, 46, 0.15)",
        30: "rgba(176, 141, 46, 0.3)",
      },
      green: {
        DEFAULT: "#3d6b4f",
        15: "rgba(61, 107, 79, 0.15)",
      },
      red: {
        DEFAULT: "#a33b2e",
        15: "rgba(163, 59, 46, 0.15)",
      },
      amber: {
        DEFAULT: "#b57e2e",
        15: "rgba(181, 126, 46, 0.15)",
      },
    },
    fontFamily: {
      serif: ["var(--font-fraunces)", "serif"],
      mono: ["var(--font-ibm-plex-mono)", "monospace"],
    },
    extend: {
      transitionTimingFunction: {
        stamp: "cubic-bezier(0.16, 1, 0.3, 1)",
        slam: "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      transitionDuration: {
        "120": "120ms",
        "240": "240ms",
        "420": "420ms",
        "640": "640ms",
        "900": "900ms",
      },
    },
  },
  plugins: [],
};

export default config;
