/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        18: "4.5rem",
      },
      backgroundImage: {
        "chatbot-text-gradient":
          "linear-gradient(90deg, #0A0530 0%, #4D5DCE 43.75%, #436EE3 100%)",
      },
    },
  },
  plugins: [],
}
