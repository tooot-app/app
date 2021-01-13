import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, Text } from 'react-native'

export interface Props {
  content: string
}

// Used for Android mostly
const HeaderCenter = React.memo(
  ({ content }: Props) => {
    const { theme } = useTheme()

    return (
      <Text
        style={[styles.text, { color: theme.primary }]}
        children={content}
      />
    )
  },
  () => true
)

const styles = StyleSheet.create({
  text: {
    ...StyleConstants.FontStyle.M
  }
})

export default HeaderCenter
