/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6"
        },
        accent: "#1D4ED8",
        muted: "#6B7280",
        background: "#F3F4F6"
      },
      borderRadius: {
        "xl": "1rem"
      }
    }
  },
  plugins: []
};

