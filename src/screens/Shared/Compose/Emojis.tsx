import { forEach, groupBy, sortBy } from 'lodash'
import React, { Dispatch } from 'react'
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

import { PostAction, PostState } from '../Compose'
import updateText from './updateText'

export interface Props {
  textInputRef: React.RefObject<TextInput>
  onChangeText: any
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeEmojis: React.FC<Props> = ({
  textInputRef,
  onChangeText,
  postState,
  postDispatch
}) => {
  const { theme } = useTheme()

  let sortedEmojis: { title: string; data: Mastodon.Emoji[] }[] = []
  forEach(
    groupBy(sortBy(postState.emojis, ['category', 'shortcode']), 'category'),
    (value, key) => sortedEmojis.push({ title: key, data: value })
  )

  return (
    <View style={styles.base}>
      <SectionList
        horizontal
        sections={sortedEmojis}
        keyExtractor={item => item.shortcode}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.group, { color: theme.secondary }]}>
            {title}
          </Text>
        )}
        renderItem={({ section, index }) => {
          if (index === 0) {
            return (
              <View key={section.title} style={styles.emojis}>
                {section.data.map(emoji => (
                  <Pressable
                    key={emoji.shortcode}
                    onPress={() => {
                      updateText({
                        onChangeText,
                        postState,
                        newText: `:${emoji.shortcode}:`
                      })
                      textInputRef.current?.focus()
                      postDispatch({ type: 'overlay', payload: null })
                    }}
                  >
                    <Image source={{ uri: emoji.url }} style={styles.emoji} />
                  </Pressable>
                ))}
              </View>
            )
          } else {
            return null
          }
        }}
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
