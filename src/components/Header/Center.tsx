import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'

export interface Props {
  content: string
  inverted?: boolean
}

// Used for Android mostly
const HeaderCenter = React.memo(
  ({ content, inverted = false }: Props) => {
    const { colors } = useTheme()

    return (
      <CustomText
        style={{
          fontSize: 18,
          fontWeight: StyleConstants.Font.Weight.Bold,
          color: inverted ? colors.primaryOverlay : colors.primaryDefault
        }}
        children={content}
      />
    )
  },
  (prev, next) => prev.content === next.content
)

export default HeaderCenter
