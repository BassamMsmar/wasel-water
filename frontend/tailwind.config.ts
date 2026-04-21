import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          dark: '#0f172a',    // Deep slate
          DEFAULT: '#002640', // Deep sophisticated navy
          ocean: '#0ea5e9',   // Vivid cyan
          ice: '#f0f9ff'      // Clean icy white
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(14, 165, 233, 0.3)',
      }
    },
  },
  plugins: [],
}
export default config
