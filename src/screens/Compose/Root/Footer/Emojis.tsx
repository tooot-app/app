import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native'
import FastImage from 'react-native-fast-image'
import validUrl from 'valid-url'
import updateText from '../../updateText'
import ComposeContext from '../../utils/createContext'

const SingleEmoji = ({ emoji }: { emoji: Mastodon.Emoji }) => {
  const { t } = useTranslation()
  const { reduceMotionEnabled } = useAccessibility()

  const { composeState, composeDispatch } = useContext(ComposeContext)
  const onPress = useCallback(() => {
    analytics('compose_emoji_add')
    updateText({
      composeState,
      composeDispatch,
      newText: `:${emoji.shortcode}:`,
      type: 'emoji'
    })
    haptics('Light')
  }, [composeState])
  const children = useMemo(() => {
    const uri = reduceMotionEnabled ? emoji.static_url : emoji.url
    if (validUrl.isHttpsUri(uri)) {
      return (
        <FastImage
          accessibilityLabel={t('common:customEmoji.accessibilityLabel', {
            emoji: emoji.shortcode
          })}
          accessibilityHint={t(
            'screenCompose:content.root.footer.emojis.accessibilityHint'
          )}
          source={{ uri: reduceMotionEnabled ? emoji.static_url : emoji.url }}
          style={styles.emoji}
        />
      )
    } else {
      return null
    }
  }, [])
  return (
    <Pressable key={emoji.shortcode} onPress={onPress} children={children} />
  )
}

export interface Props {
  accessibleRefEmojis: RefObject<SectionList>
}

const ComposeEmojis: React.FC<Props> = ({ accessibleRefEmojis }) => {
  const { composeState } = useContext(ComposeContext)
  const { theme } = useTheme()

  useEffect(() => {
    const tagEmojis = findNodeHandle(accessibleRefEmojis.current)
    if (composeState.emoji.active) {
      tagEmojis && AccessibilityInfo.setAccessibilityFocus(tagEmojis)
    }
  }, [composeState.emoji.active])

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
        accessible
        ref={accessibleRefEmojis}
        horizontal
        keyboardShouldPersistTaps='always'
        sections={composeState.emoji.emojis || []}
        keyExtractor={item => item.shortcode}
        renderSectionHeader={listHeader}
        renderItem={listItem}
        windowSize={2}
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
