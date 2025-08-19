/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",   // 确保 index.html 也被扫描
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 扫描 src 下的所有文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

