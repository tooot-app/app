module.exports = function (api) {
  api.cache(false)

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@components': './src/components',
            '@i18n': './src/i18n',
            '@screens': './src/screens',
            '@utils': './src/utils'
          }
        }
      ]
    ].concat(
      process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production'
        ? ['transform-remove-console']
        : [],
      ['react-native-reanimated/plugin']
    )
  }
}
