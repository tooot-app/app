import { Dimensions } from 'react-native'

const { width } = Dimensions.get('screen')

const guidelineBaseWidth = 375
// const guidelineBaseHeight = 667

const scale = (size: number) => (width / guidelineBaseWidth) * size
// const verticalScale = (size: number) => (height / guidelineBaseHeight) * size
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor

const Base = 4

export const StyleConstants = {
  Font: {
    Size: { S: moderateScale(14), M: moderateScale(16), L: moderateScale(18) },
    LineHeight: {
      S: moderateScale(20),
      M: moderateScale(22),
      L: moderateScale(30)
    },
    Weight: { Normal: '400' as '400', Bold: '600' as '600' }
  },
  FontStyle: {
    S: { fontSize: moderateScale(14), lineHeight: moderateScale(20) },
    M: { fontSize: moderateScale(16), lineHeight: moderateScale(22) },
    L: { fontSize: moderateScale(20), lineHeight: moderateScale(30) }
  },

  Spacing: {
    XS: Base,
    S: Base * 2,
    M: Base * 4,
    L: Base * 6,
    XL: Base * 10,
    Global: { PagePadding: Base * 4 }
  },

  Avatar: { S: 40, M: 52, L: 96 }
}
