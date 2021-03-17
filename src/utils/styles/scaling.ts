// import { Dimensions } from 'react-native'

// const { width } = Dimensions.get('screen')

// const guidelineBaseWidth = 375
// const guidelineBaseHeight = 667

// const scale = (size: number) => (width / guidelineBaseWidth) * size
// const verticalScale = (size: number) => (height / guidelineBaseHeight) * size
// const adaptiveScale = (size: number, factor: number = 0) =>
//   size + (scale(size) - size) * factor
const adaptiveScale = (size: number, factor: number = 0) =>
  size + size * (factor / 8)

export { adaptiveScale }
