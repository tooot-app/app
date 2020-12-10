import React, { Dispatch, useCallback, useMemo } from 'react'
import {
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

import { PostAction, ComposeState } from '../Compose'
import updateText from './updateText'

export interface Props {
  textInputRef: React.RefObject<TextInput>
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
}

const SingleEmoji = ({
  emoji,
  textInputRef,
  composeState,
  composeDispatch
}: { emoji: Mastodon.Emoji } & Props) => {
  const onPress = useCallback(() => {
    updateText({
      origin: textInputRef.current?.isFocused() ? 'text' : 'spoiler',
      composeState,
      composeDispatch,
      newText: `:${emoji.shortcode}:`,
      type: 'emoji'
    })
    composeDispatch({
      type: 'emoji',
      payload: { ...composeState.emoji, active: false }
    })
  }, [])
  const children = useMemo(
    () => <Image source={{ uri: emoji.url }} style={styles.emoji} />,
    []
  )
  return (
    <Pressable key={emoji.shortcode} onPress={onPress} children={children} />
  )
}

const ComposeEmojis: React.FC<Props> = ({ ...props }) => {
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
        <SingleEmoji key={emoji.shortcode} emoji={emoji} {...props} />
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
        sections={props.composeState.emoji.emojis!}
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
    fontSize: StyleConstants.Font.Size.S
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

export default ComposeEmojis
