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
        indeed: {
          primary: '#2557a7',
          secondary: '#164081',
          accent: '#2557a7',
          neutral: '#2d2d2d',
          'base-100': '#ffffff',
          'base-200': '#f3f2f1',
          'base-300': '#d4d2d0',
          'base-content': '#2d2d2d',
          info: '#2557a7',
          success: '#057642',
          warning: '#f3c621',
          error: '#c9262d',
          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.5rem',
          '--border-btn': '1px',
        },
      },
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
