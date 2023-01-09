module.exports = function (api) {
  api.cache(false)

  const plugins = [
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
    ],
    'react-native-reanimated/plugin'
  ]

  if (process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production') {
    plugins.push('transform-remove-console')
  }

  return { presets: ['babel-preset-expo'], plugins }
}
