/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pinkbar: "var(--pink-500)",
        pinksoft: "var(--pink-300)",
        blush: "var(--pink-100)",
        alert: "var(--red-500)",
        alertdeep: "var(--red-600)",
        bluebar: "var(--blue-500)",
        bluesoft: "var(--blue-300)",
        midnight: "var(--blue-900)",
        ink: "var(--ink)",
      },
      borderRadius: {
        glass: "24px",
      },
    },
  },
  plugins: [],
};
