import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
    darkMode: 'class',
    content: ['./components/**/*.vue', './pages/**/*.vue'],
    theme: {
        extend: {
            colors: {
                'secondary-pink':  'var(--color-secondary-pink)',
                'secondary-orange':'var(--color-secondary-orange)',
                'secondary-purple':'var(--color-secondary-purple)',
                'secondary-blue':  'var(--color-secondary-blue)',
                'secondary-cyan':  'var(--color-secondary-cyan)',
            },
            backgroundImage: {
                'text-gradient':
                    'linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))',
            },
            borderRadius: {
                'xxl': '0.75rem',
            }
        }
    }
} satisfies Config;
