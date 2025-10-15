/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Use class-based dark mode (toggle by adding/removing `class="dark"` on <html> or <body>)
  darkMode: "class",

  theme: {
    extend: {
      // Add/override only what you need; keep minimal at first
      colors: {
        brand: {
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(34,197,94,.25)",
      },
    },
  },

  // Plugins you actually use
  plugins: [
    // install first: npm i -D tailwind-scrollbar
    require("tailwind-scrollbar")({ nocompatible: true }),
    // Examples you can enable later:
    // require("@tailwindcss/forms"),
    // require("@tailwindcss/typography"),
    // require("@tailwindcss/aspect-ratio"),
    // require("@tailwindcss/line-clamp"),
  ],

  // Needed for `scrollbar-thumb-rounded`
  variants: {
    scrollbar: ["rounded"],
  },

  // If you build dynamic class names (e.g., text-${color}-600), safelist them here
  // Remove if not needed
  safelist: [
    { pattern: /(bg|text|border)-(green|red|neutral)-(100|300|500|600)/ },
    { pattern: /scrollbar-thumb-(green|neutral)-(500|600)\/(40|50|70)/ },
  ],

  // ——— Optional toggles ———
  // If Tailwind’s CSS reset breaks existing styles, temporarily disable it:
  // corePlugins: { preflight: false },

  // If you fear class name clashes with legacy CSS, add a prefix (then use tw-p-4, tw-flex, etc.):
  // prefix: "tw-",
};
