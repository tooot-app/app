module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
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
