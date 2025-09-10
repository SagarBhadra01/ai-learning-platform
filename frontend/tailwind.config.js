/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) translateX(10px) rotate(2deg)' },
        },
        'float-medium': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) translateX(-5px) rotate(-1deg)' },
        },
        'float-fast': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) translateX(5px) rotate(1deg)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-medium': 'float-medium 6s ease-in-out infinite',
        'float-fast': 'float-fast 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
