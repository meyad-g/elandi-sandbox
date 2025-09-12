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
        primary: {
          cosmos: '#272421',
          stellar: '#FCFBF8',
          galaxy: {
            2: '#034A4A',
            3: '#015F5F',
            4: '#045757',
          },
          fornax: {
            1: '#3F1127',
            2: '#2B0315',
            3: '#240212',
            4: '#2B0315',
            5: '#18020C',
          },
          scarlet: {
            1: '#FF4949',
            2: '#FFE3DE',
            3: '#E84545',
            4: '#B01B1B',
          },
          boreal: {
            DEFAULT: '#D3F9F5',
            glow: '#74D0C6',
          },
          ethereal: {
            lilac: '#D6D8FF',
          },
        },
        secondary: {
          celestial: '#F9C7BF',
          eclipse: {
            3: '#2A0F30',
          },
          ethereal: {
            1: '#B6B9FF',
            2: '#A892FF',
            3: '#917CE2',
          },
          pink: '#FFB9E5',
          galaxy: {
            1: '#107272',
            2: '#015F5F',
            3: '#045757',
          },
          halo: '#AFFA9C',
          cloud: '#F7F7E2',
          sunrise: '#E75A3E',
          sol: {
            3: '#FEBE19',
            4: '#E5AB17',
          },
          aster: '#FFF0D4',
          midnight: '#06142E',
          orion: {
            1: '#00266E',
            2: '#001742',
            3: '#33518B',
          },
        },
        tertiary: {
          1: '#141313',
          2: '#E5E1E0',
          3: '#585858',
          4: '#757575',
          5: '#A9A9A9',
          6: '#CCCCCC',
          7: '#BFB7B6',
          8: '#E6E1E0',
          9: '#F0ECEB',
          '9.5': '#F9F9F9',
          10: '#FFFFFF',
        },
        semantic: {
          success: {
            1: '#DBF0D5',
            2: '#46982F',
          },
          warning: {
            1: '#FFECB3',
          },
          error: {
            1: '#F7D9D9',
            2: '#F02424',
          },
        },
      },
      fontFamily: {
        'dm-mono': ['DM Mono', 'monospace'],
        'geist-sans': ['Geist', 'sans-serif'],
        'geist-mono': ['Geist Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      scrollbar: {
        thin: 'scrollbar-thin',
        thumb: 'scrollbar-thumb-rounded scrollbar-thumb',
        track: 'scrollbar-track-rounded scrollbar-track',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
