/** @type {import('tailwindcss').Config} */
module.exports = {
  // BARIS INI WAJIB ADA UNTUK TOMBOL BULAN/MATAHARI
  darkMode: 'class', 

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Warna pastel custom (opsional)
      colors: {
        pastelBlue: '#E3F2FD',
        pastelPurple: '#F3E5F5',
        pastelPink: '#FCE4EC',
      },
    },
  },
  plugins: [],
}