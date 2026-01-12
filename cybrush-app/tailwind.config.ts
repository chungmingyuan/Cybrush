import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Noto Serif SC"', 'serif'],
                script: ['"Ma Shan Zheng"', 'cursive'],
                brush: ['"Zhi Mang Xing"', 'cursive'],
            },
            colors: {
                cybrush: {
                    gold: '#D4AF37',
                    red: '#cc0000',
                    seal: '#a81c1c',
                    bg: '#080808',
                }
            }
        },
    },
    plugins: [],
} satisfies Config
