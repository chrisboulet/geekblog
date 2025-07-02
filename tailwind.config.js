/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-glass': 'var(--bg-glass)',
        'neural-purple': 'var(--neural-purple)',
        'neural-pink': 'var(--neural-pink)',
        'neural-blue': 'var(--neural-blue)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
      },
      boxShadow: {
        'neural-glow-purple': '0 0 15px 5px var(--glow-color-purple)',
        'neural-glow-pink': '0 0 15px 5px var(--glow-color-pink)',
        'neural-glow-blue': '0 0 15px 5px var(--glow-color-blue)',
        'neural-md-purple': '0 4px 6px -1px var(--glow-color-purple), 0 2px 4px -2px var(--glow-color-purple)',
        'neural-md-pink': '0 4px 6px -1px var(--glow-color-pink), 0 2px 4px -2px var(--glow-color-pink)',
        'neural-md-blue': '0 4px 6px -1px var(--glow-color-blue), 0 2px 4px -2px var(--glow-color-blue)',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
        particleFloat: { // Exemple d'animation pour l'arrière-plan "flux de données"
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'particle-float': 'particleFloat 15s ease-in-out infinite',
      },
      // Configuration pour le plugin typography (prose)
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text-secondary'),
            a: {
              color: theme('colors.neural-pink'),
              '&:hover': {
                color: theme('colors.neural-blue'),
              },
            },
            h1: { color: theme('colors.text-primary') },
            h2: { color: theme('colors.text-primary') },
            h3: { color: theme('colors.text-primary') },
            strong: { color: theme('colors.text-primary') },
            // ... autres styles de prose pour correspondre au thème sombre
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // require('tailwindcss-animate'), // Déjà listé dans le package.json, peut être activé ici
  ],
}
