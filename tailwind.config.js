const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "spin-fast": "spin 0.5s linear infinite",
      },
      colors: {
        base: colors.neutral,
        primary: colors.stone,
        info: colors.blue,
        success: colors.green,
        warn: colors.orange,
        error: colors.red,
      },
    },
  },
  plugins: [],
};
