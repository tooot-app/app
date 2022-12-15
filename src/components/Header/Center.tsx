import CustomText from '@components/Text'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { View } from 'react-native'

export interface Props {
  content?: string
  inverted?: boolean
  onPress?: () => void
}

// Used for Android mostly
const HeaderCenter: React.FC<Props> = ({ content, inverted = false, onPress }) => {
  const { colors } = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <CustomText
        style={{
          color: inverted ? colors.primaryOverlay : colors.primaryDefault
        }}
        fontSize='L'
        fontWeight='Bold'
        numberOfLines={1}
        children={content}
        {...(onPress && { onPress })}
      />
    </View>
  )
}

export default HeaderCenter
