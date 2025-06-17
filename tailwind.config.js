/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        greenCeccarelli: {
          primary: "#029834",
          light: "#26ad53",
          lighter: "#0bbd46",
          dark: "#166931",
          half: "rgb(2 152 52 / 0.5)",
          halfSolid: "rgb(128 203 153)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
    },
  },
  plugins: [],
}