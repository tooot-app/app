import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { useAppDispatch } from '@root/store'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { countInstanceEmoji } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import { chunk } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  SectionList,
  TextInput,
  View
} from 'react-native'
import FastImage from 'react-native-fast-image'
import validUrl from 'valid-url'
import EmojisContext from './helpers/EmojisContext'

const EmojisList = React.memo(
  () => {
    const dispatch = useAppDispatch()
    const { reduceMotionEnabled } = useAccessibility()
    const { t } = useTranslation()

    const { emojisState } = useContext(EmojisContext)
    const { colors, mode } = useTheme()

    const addEmoji = (shortcode: string) => {
      if (!emojisState.targetProps) {
        return
      }

      const inputValue = emojisState.targetProps.value
      const maxLength = emojisState.targetProps.maxLength
      const selectionRange = emojisState.targetProps.selectionRange || {
        start: emojisState.targetProps.value.length,
        end: emojisState.targetProps.value.length
      }

      if (inputValue?.length) {
        const contentFront = inputValue.slice(0, selectionRange.start)
        const contentRear = inputValue.slice(selectionRange.end)

        const whiteSpaceRear = /\s/g.test(contentRear.slice(-1))

        const newTextWithSpace = ` ${shortcode}${whiteSpaceRear ? '' : ' '}`
        emojisState.targetProps.setValue(
          [contentFront, newTextWithSpace, contentRear].join('').slice(0, maxLength)
        )
      } else {
        emojisState.targetProps.setValue(`${shortcode} `.slice(0, maxLength))
      }
    }

    const listItem = useCallback(
      ({ index, item }: { item: Mastodon.Emoji[]; index: number }) => {
        return (
          <View
            key={index}
            style={{
              flex: 1,
              flexWrap: 'wrap',
              marginTop: StyleConstants.Spacing.M,
              marginRight: StyleConstants.Spacing.S
            }}
          >
            {item.map(emoji => {
              const uri = reduceMotionEnabled ? emoji.static_url : emoji.url
              if (validUrl.isHttpsUri(uri)) {
                return (
                  <Pressable
                    key={emoji.shortcode}
                    onPress={() => {
                      addEmoji(`:${emoji.shortcode}:`)
                      dispatch(countInstanceEmoji(emoji))
                    }}
                    style={{ padding: StyleConstants.Spacing.S }}
                  >
                    <FastImage
                      accessibilityLabel={t('common:customEmoji.accessibilityLabel', {
                        emoji: emoji.shortcode
                      })}
                      accessibilityHint={t(
                        'screenCompose:content.root.footer.emojis.accessibilityHint'
                      )}
                      source={{ uri }}
                      style={{ width: 32, height: 32 }}
                    />
                  </Pressable>
                )
              } else {
                return null
              }
            })}
          </View>
        )
      },
      [emojisState.targetProps]
    )

    const listRef = useRef<SectionList>(null)
    useEffect(() => {
      const tagEmojis = findNodeHandle(listRef.current)
      if (emojisState.targetProps) {
        layoutAnimation()
        tagEmojis && AccessibilityInfo.setAccessibilityFocus(tagEmojis)
      }
    }, [emojisState.targetProps])

    const [search, setSearch] = useState('')
    const searchLength = useRef(0)
    useEffect(() => {
      if (
        (search.length === 0 && searchLength.current === 1) ||
        (search.length === 1 && searchLength.current === 0)
      ) {
        layoutAnimation()
      }
      searchLength.current = search.length
    }, [search.length, searchLength.current])

    return emojisState.targetProps ? (
      <View
        style={{
          paddingBottom: StyleConstants.Spacing.Global.PagePadding,
          backgroundColor: colors.backgroundDefault
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: StyleConstants.Spacing.Global.PagePadding,
            paddingBottom: StyleConstants.Spacing.S
          }}
        >
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              alignSelf: 'stretch',
              justifyContent: 'center',
              paddingRight: StyleConstants.Spacing.S
            }}
          >
            <Icon name='Search' size={StyleConstants.Font.Size.L} color={colors.secondary} />
          </View>
          <TextInput
            style={{
              flex: 1,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              ...StyleConstants.FontStyle.M,
              color: colors.primaryDefault,
              paddingVertical: StyleConstants.Spacing.S
            }}
            onChangeText={setSearch}
            autoCapitalize='none'
            clearButtonMode='always'
            keyboardAppearance={mode}
            autoCorrect={false}
            spellCheck={false}
          />
        </View>
        <SectionList
          accessible
          ref={listRef}
          horizontal
          keyboardShouldPersistTaps='always'
          sections={
            search.length
              ? [
                  {
                    title: 'Search result',
                    data: chunk(
                      emojisState.emojis
                        .filter(e => e.type !== 'frequent')
                        .flatMap(e =>
                          e.data.flatMap(e => e).filter(emoji => emoji.shortcode.includes(search))
                        ),
                      2
                    )
                  }
                ]
              : emojisState.emojis
          }
          keyExtractor={item => item[0]?.shortcode}
          renderSectionHeader={({ section: { title } }) => (
            <CustomText fontStyle='S' style={{ position: 'absolute', color: colors.secondary }}>
              {title}
            </CustomText>
          )}
          renderItem={listItem}
          windowSize={4}
          contentContainerStyle={{
            paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
            minHeight: 32 * 2 + StyleConstants.Spacing.M * 3
          }}
        />
      </View>
    ) : null
  },
  () => true
)

export default EmojisList
