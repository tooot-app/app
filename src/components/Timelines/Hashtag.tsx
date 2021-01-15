import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

export interface Props {
  tag: Mastodon.Tag
  onPress: () => void
}

const ComponentHashtag: React.FC<Props> = ({ tag, onPress }) => {
  const { theme } = useTheme()

  return (
    <Pressable
      style={[styles.itemDefault, { borderBottomColor: theme.border }]}
      onPress={onPress}
    >
      <Text style={[styles.itemHashtag, { color: theme.primary }]}>
        #{tag.name}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  itemDefault: {
    padding: StyleConstants.Spacing.S * 1.5,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  itemHashtag: {
    ...StyleConstants.FontStyle.M
  }
})

export default ComponentHashtag
