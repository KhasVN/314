module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    '../../libs/shared/dtos/src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        talent: {
          primary: '#040415',
          secondary: '#c8e4f6',
          accent: '#fdf1af',
          neutral: '#040415',
          'base-100': '#ffffff',
          'base-200': '#f6f6f4',
          'base-300': '#d8d8d2',
          'base-content': '#040415',
          info: '#c8e4f6',
          success: '#d9f7be',
          warning: '#fdf1af',
          error: '#ff6b6b',
        },
      },
    ],
  },
};
