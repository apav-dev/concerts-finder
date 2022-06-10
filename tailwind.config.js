module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    'node_modules/@yext/answers-react-components/lib/components/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['MavenPro'],
      },
      boxShadow: {
        searchBar:
          '0px 24px 38px 3px hsla(0,0%,0%,0.14), 0px 9px 46px 8px hsla(0,0%,0%,0.12), 0px 11px 15px -7px hsla(0,0%,0%,0.2)',
        bottom: '-3px 2px 2px rgba(0, 0, 0, 0.1)',
        top: '-3px -2px 2px rgba(0, 0, 0, 0.1)',
      },
      colors: {
        backgroundGray: '#e3e2df',
        hoverBackgroundGray: '#cccbc9',
        cardGray: '#ebebe9',
        fontPink: '#ee4c7c',
        spotifyGreen: '#44c767',
      },
      transitionProperty: {
        height: 'height',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
