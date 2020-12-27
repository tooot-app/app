jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
  ...require.requireActual(
    'react-native/Libraries/LayoutAnimation/LayoutAnimation'
  ),
  configureNext: jest.fn()
}))
