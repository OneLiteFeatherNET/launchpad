import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
    darkMode: 'class',
    content: [
        './components/**/*.{vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './app.vue',
        './plugins/**/*.{ts,js}'
    ],
    theme: {
        extend: {
            // Farben über CSS-Variablen verfügbar machen (Tailwind-kompatibel)
            colors: {
                // Semantische Brand-Tokens
                primary: {
                    DEFAULT: 'var(--color-brand-primary)',
                    fg: '#FFFFFF'
                },
                secondary: {
                    DEFAULT: 'var(--color-brand-secondary)',
                    fg: '#0b1020'
                },
                accent: {
                    DEFAULT: 'var(--color-brand-accent)',
                    fg: '#FFFFFF'
                },
                orange: {
                    DEFAULT: 'var(--color-brand-orange)',
                    fg: '#0b1020'
                },
                purple: {
                    DEFAULT: 'var(--color-brand-purple)',
                    fg: '#FFFFFF'
                },
                // UI-Neutrals
                bg: 'var(--color-bg)',
                surface: 'var(--color-surface)',
                text: 'var(--color-text)',
                muted: 'var(--color-muted)',
                border: 'var(--color-border)',
                white: 'var(--color-white)'
            },
            backgroundImage: {
                'gradient-brand': 'var(--gradient-brand)',
                'gradient-accent': 'var(--gradient-accent)'
            },
            ringColor: {
                DEFAULT: 'var(--color-brand-secondary)'
            },
            borderColor: {
                DEFAULT: 'var(--color-border)'
            }
        }
    }
} satisfies Config;
