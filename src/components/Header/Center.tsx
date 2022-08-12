import CustomText from '@components/Text'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'

export interface Props {
  content: React.ReactNode | string
  inverted?: boolean
  onPress?: () => void
}

// Used for Android mostly
const HeaderCenter: React.FC<Props> = ({
  content,
  inverted = false,
  onPress
}) => {
  const { colors } = useTheme()

  return (
    <CustomText
      style={{
        fontSize: 18,
        color: inverted ? colors.primaryOverlay : colors.primaryDefault
      }}
      fontWeight='Bold'
      children={content}
      {...(onPress && { onPress })}
    />
  )
}

export default HeaderCenter
