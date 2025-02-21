const CracoAlias = require('craco-alias');

module.exports = {
  resolve: {
    fallback: {
      "os": false,
      "crypto": false
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        tsConfigPath: './tsconfig.paths.json',
      },
    },
  ],
  webpack: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
};
