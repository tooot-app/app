import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, Text } from 'react-native'

export interface Props {
  content: string
  inverted?: boolean
}

// Used for Android mostly
const HeaderCenter = React.memo(
  ({ content, inverted = false }: Props) => {
    const { colors } = useTheme()

    return (
      <Text
        style={[
          styles.text,
          { color: inverted ? colors.primaryOverlay : colors.primaryDefault }
        ]}
        children={content}
      />
    )
  },
  (prev, next) => prev.content === next.content
)

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: StyleConstants.Font.Weight.Bold
  }
})

export default HeaderCenter
