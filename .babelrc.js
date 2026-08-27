module.exports = {
  presets: [['next/babel', { 'preset-react': { development: process.env.NODE_ENV === 'development' } }]],
  plugins: process.env.NODE_ENV === 'production' ? [] : ['@react-dev-inspector/babel-plugin'],
};
