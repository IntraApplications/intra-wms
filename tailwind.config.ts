import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        secondaryBorder: 'var(--color-secondary-border)',
        tertiary: 'var(--color-tertiary)',
        tertiaryBorder: 'var(--color-tertiary-border)',
        
        
        /* opposite of primary, used for text on primary backgrounds */
        neutral: 'var(--color-neutral)', 

        /* used to compliment borders that use a primary background */
        accent: 'var(--color-accent)',

        /* border also */

        border: 'var(--color-border)',
        alert: 'var(--color-alert)',
        dashboard: 'var(--color-dashboard)',
        sidenav: 'var(--color-sidenav)'
        
      }
    },
  },
  plugins: [],
};
export default config;
