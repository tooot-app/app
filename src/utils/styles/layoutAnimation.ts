import { AccessibilityInfo, LayoutAnimation } from 'react-native'

const layoutAnimation = async () => {
  const disable = await AccessibilityInfo.isReduceMotionEnabled()
  if (disable) return

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
}

export default layoutAnimation
