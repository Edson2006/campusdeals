/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scanne tous tes fichiers React
  ],
  theme: {
    extend: {
      // On peut ajouter des effets spéciaux ici plus tard
    },
  },
  plugins: [],
}