import { useEffect } from 'react'
import { Appearance, Pressable } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import { ShareMenuReactView } from 'react-native-share-menu'

// mimeType
// text/plain - text only, website URL, video?!
// image/jpeg - image
// video/mp4 - video

const colors = {
  primary: {
    light: 'rgb(18, 18, 18)',
    dark: 'rgb(180, 180, 180)'
  },
  background: {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(18, 18, 18)'
  }
}

const ShareExtension = () => {
  useEffect(() => {
    ShareMenuReactView.continueInApp()
  }, [])

  const theme = Appearance.getColorScheme() || 'light'

  return (
    <Pressable
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background[theme]
      }}
    >
      <Circle size={18} color={colors.primary[theme]} />
    </Pressable>
  )
}

export default ShareExtension
