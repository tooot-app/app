module.exports = function (api) {
  api.cache(true)

  const plugins = [
    '@babel/plugin-proposal-optional-chaining',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@assets': './assets',
          '@root': './src',
          '@api': './src/api',
          '@helpers': './src/helpers',
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils'
        }
      }
    ],
    'react-native-reanimated/plugin'
  ]

  if (
    process.env.NODE_ENV === 'production' ||
    process.env.BABEL_ENV === 'production'
  ) {
    plugins.push('transform-remove-console')
  }

  return {
    presets: ['babel-preset-expo'],
    plugins
  }
}
