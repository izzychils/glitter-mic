/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'blood-pink': 'var(--blood-pink)',
        'blood-pink-light': 'var(--blood-pink-light)',
        'blood-pink-dark': 'var(--blood-pink-dark)',
        'blood-red': 'var(--blood-red)',
        'blood-red-light': 'var(--blood-red-light)',
        'blood-red-dark': 'var(--blood-red-dark)',
        'navy': 'var(--navy)',
        'navy-light': 'var(--navy-light)',
        'navy-lighter': 'var(--navy-lighter)',
        'navy-dark': 'var(--navy-dark)',
      },
      borderRadius: {
        glass: "16px",
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
