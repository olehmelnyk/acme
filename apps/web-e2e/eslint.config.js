const { join } = require('path');
const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: baseConfig
});

module.exports = [...baseConfig];
