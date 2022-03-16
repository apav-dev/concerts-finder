module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    'node_modules/@yext/answers-react-components/lib/components/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Inter'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
