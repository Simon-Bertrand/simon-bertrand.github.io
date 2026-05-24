import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/**/*.{astro,html,js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
  ],
}
