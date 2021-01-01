import haptics from '@components/haptics'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useContext, useMemo } from 'react'
import {
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native'
import ComposeContext from './utils/createContext'
import updateText from './updateText'

const SingleEmoji = ({ emoji }: { emoji: Mastodon.Emoji }) => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const onPress = useCallback(() => {
    updateText({
      composeState,
      composeDispatch,
      newText: `:${emoji.shortcode}:`,
      type: 'emoji'
    })
    composeDispatch({
      type: 'emoji',
      payload: { ...composeState.emoji, active: false }
    })
    haptics('Success')
  }, [])
  const children = useMemo(
    () => <Image source={{ uri: emoji.url }} style={styles.emoji} />,
    []
  )
  return (
    <Pressable key={emoji.shortcode} onPress={onPress} children={children} />
  )
}

const ComposeEmojis: React.FC = () => {
  const { composeState } = useContext(ComposeContext)
  const { theme } = useTheme()

  const listHeader = useCallback(
    ({ section: { title } }) => (
      <Text style={[styles.group, { color: theme.secondary }]}>{title}</Text>
    ),
    []
  )

  const emojiList = useCallback(
    section =>
      section.data.map((emoji: Mastodon.Emoji) => (
        <SingleEmoji key={emoji.shortcode} emoji={emoji} />
      )),
    []
  )
  const listItem = useCallback(
    ({ section, index }) =>
      index === 0 ? (
        <View key={section.title} style={styles.emojis}>
          {emojiList(section)}
        </View>
      ) : null,
    []
  )

  return (
    <View style={styles.base}>
      <SectionList
        horizontal
        keyboardShouldPersistTaps='handled'
        sections={composeState.emoji.emojis!}
        keyExtractor={item => item.shortcode}
        renderSectionHeader={listHeader}
        renderItem={listItem}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    height: 260
  },
  group: {
    position: 'absolute',
    left: StyleConstants.Spacing.L,
    ...StyleConstants.FontStyle.S
  },
  emojis: {
    flex: 1,
    flexWrap: 'wrap',
    marginTop: StyleConstants.Spacing.M,
    marginLeft: StyleConstants.Spacing.M
  },
  emoji: {
    width: 32,
    height: 32,
    padding: StyleConstants.Spacing.S,
    margin: StyleConstants.Spacing.S
  }
})

export default React.memo(ComposeEmojis, () => true)
