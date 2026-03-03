/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        md: "600px",
        xs: "300px",
      },
      fontFamily: {
       "":""
      },
      keyframes: {
        "mouse-wheel": {
          "0%": { opacity: "1", transform: "translate(-50%, 0px)" },
          "70%": { opacity: "1", transform: "translate(-50%, 14px)" },
          "100%": { opacity: "0", transform: "translate(-50%, 16px)" },
        },
        "mouse-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(4px)" },
        },
      },
      animation: {
        "mouse-wheel": "mouse-wheel 1.2s ease-in-out infinite",
        "mouse-float": "mouse-float 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
