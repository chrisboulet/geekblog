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
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-glass': 'var(--bg-glass)',
        'bg-glass-heavy': 'var(--bg-glass-heavy)',
        'neural-purple': 'var(--neural-purple)',
        'neural-pink': 'var(--neural-pink)',
        'neural-blue': 'var(--neural-blue)',
        'neural-cyan': 'var(--neural-cyan)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-disabled': 'var(--text-disabled)',
      },
      boxShadow: {
        'neural-glow-sm': 'var(--glow-sm)',
        'neural-glow-md': 'var(--glow-md)',
        'neural-glow-lg': 'var(--glow-lg)',
        'neural-shadow-sm': 'var(--shadow-sm)',
        'neural-shadow-md': 'var(--shadow-md)',
        'neural-shadow-lg': 'var(--shadow-lg)',
        'neural-shadow': 'var(--shadow-neural)',
        // Compatibility
        'neural-glow-purple': '0 0 15px 5px var(--glow-color-purple)',
        'neural-glow-pink': '0 0 15px 5px var(--glow-color-pink)',
        'neural-glow-blue': '0 0 15px 5px var(--glow-color-blue)',
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
