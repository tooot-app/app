module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-optional-chaining'],
      ['babel-plugin-typescript-to-proptypes'],
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
