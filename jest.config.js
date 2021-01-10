module.exports = {
  preset: 'jest-expo',
  collectCoverage: true,
  collectCoverageFrom: [
    'src /**/*.{ts,tsx}',
    '!**/coverage /**',
    '!**/node_modules /**',
    '!**/app.config.ts',
    '!**/babel.config.js',
    '!**/jest.setup.ts'
  ],
  setupFiles: [
    '<rootDir>/jest/async-storage.js',
    '<rootDir>/jest/react-native.js',
    '<rootDir>/jest/react-navigation.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
      '|react-clone-referenced-element' +
      '|@react-native-community' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|react-navigation' +
      '|@react-navigation/.*|@unimodules/.*|unimodules' +
      '|sentry-expo' +
      '|native-base' +
      '|@sentry/.*' +
      '|redux-persist-expo-securestore' +
      ')'
  ]
}
