module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: ['./src/**/*.html', './src/**/*.css', './src/**/*.vue'],
  theme: {
    extend: {},
  },
  variants: {
    borderRadius: ['first', 'last'],
  },
  plugins: [],
};
