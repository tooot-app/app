module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo',
      // {
      //   runtime: 'automatic',
      //   development: process.env.NODE_ENV === 'development',
      //   importSource: '@welldone-software/why-did-you-render'
      // }
    ],
    plugins: [
      ['@babel/plugin-proposal-optional-chaining'],
      [
        'module-resolver',
        {
          alias: {
            src: './src'
          }
        }
      ]
    ]
  }
}
