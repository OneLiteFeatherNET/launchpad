import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default <Partial<Config>>{
    darkMode: 'class',                    // <— hier
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
        }
    }
}
