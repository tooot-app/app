import { emojis } from '@components/Emojis'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { connectImage } from '@utils/api/helpers/connect'
import { StorageAccount } from '@utils/storage/account'
import { getAccountStorage, setAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import { chunk } from 'lodash'
import React, { useContext, useEffect, useRef, useState } from 'react'
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
import EmojisContext from './Context'

const EmojisList = () => {
  const { reduceMotionEnabled } = useAccessibility()
  const { t } = useTranslation(['common', 'screenCompose'])

  const { emojisState, emojisDispatch } = useContext(EmojisContext)
  const { colors } = useTheme()

  const addEmoji = (shortcode: string) => {
    if (emojisState.targetIndex === -1) {
      return
    }

    const {
      value: [value, setValue],
      selection: [selection, setSelection],
      ref,
      maxLength
    } = emojisState.inputProps[emojisState.targetIndex]

    const contentFront = value.slice(0, selection.start)
    const contentRear = value.slice(selection.end || selection.start)

    const spaceFront = value.length === 0 || /\s/g.test(contentFront.slice(-1)) ? '' : ' '
    const spaceRear = /\s/g.test(contentRear[0]) ? '' : ' '

    setValue(
      [contentFront, spaceFront, shortcode, spaceRear, contentRear].join('').slice(0, maxLength)
    )

    const addedLength = spaceFront.length + shortcode.length + spaceRear.length
    setSelection({ start: selection.start + addedLength })
  }

  const listItem = ({ index, item }: { item: Mastodon.Emoji[]; index: number }) => {
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
          return (
            <Pressable
              key={emoji.shortcode}
              onPress={() => {
                addEmoji(`:${emoji.shortcode}:`)

                const HALF_LIFE = 60 * 60 * 24 * 7 // 1 week
                const calculateScore = (
                  emoji: StorageAccount['emojis_frequent'][number]
                ): number => {
                  var seconds = (new Date().getTime() - emoji.lastUsed) / 1000
                  var score = emoji.count + 1
                  var order = Math.log(Math.max(score, 1)) / Math.LN10
                  var sign = score > 0 ? 1 : score === 0 ? 0 : -1
                  return (sign * order + seconds / HALF_LIFE) * 10
                }

                const currentEmojis = getAccountStorage.object('emojis_frequent')
                const foundEmojiIndex = currentEmojis?.findIndex(
                  e => e.emoji.shortcode === emoji.shortcode && e.emoji.url === emoji.url
                )

                let newEmojisSort: StorageAccount['emojis_frequent']
                if (foundEmojiIndex === -1) {
                  newEmojisSort = currentEmojis || []
                  const temp = {
                    emoji,
                    score: 0,
                    count: 0,
                    lastUsed: new Date().getTime()
                  }
                  newEmojisSort.push({
                    ...temp,
                    score: calculateScore(temp),
                    count: temp.count + 1
                  })
                } else {
                  newEmojisSort =
                    currentEmojis
                      ?.map((e, i) =>
                        i === foundEmojiIndex
                          ? {
                              ...e,
                              score: calculateScore(e),
                              count: e.count + 1,
                              lastUsed: new Date().getTime()
                            }
                          : e
                      )
                      .sort((a, b) => b.score - a.score) || []
                }

                setAccountStorage([
                  {
                    key: 'emojis_frequent',
                    value: newEmojisSort.sort((a, b) => b.score - a.score).slice(0, 20)
                  }
                ])
              }}
              style={{ padding: StyleConstants.Spacing.S }}
            >
              <FastImage
                accessibilityLabel={t('common:customEmoji.accessibilityLabel', {
                  emoji: emoji.shortcode
                })}
                accessibilityHint={t('screenCompose:content.root.footer.emojis.accessibilityHint')}
                source={connectImage({ uri })}
                style={{ width: 32, height: 32 }}
              />
            </Pressable>
          )
        })}
      </View>
    )
  }

  const listRef = useRef<SectionList>(null)
  useEffect(() => {
    const tagEmojis = findNodeHandle(listRef.current)
    if (emojisState.targetIndex !== -1) {
      layoutAnimation()
      tagEmojis && AccessibilityInfo.setAccessibilityFocus(tagEmojis)
    }
  }, [emojisState.targetIndex])

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

  return emojisState.targetIndex !== -1 ? (
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
          paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
          paddingVertical: StyleConstants.Spacing.S
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
          <Icon name='search' size={StyleConstants.Font.Size.L} color={colors.secondary} />
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
          autoCorrect={false}
          spellCheck={false}
        />
        <Pressable
          style={{ paddingLeft: StyleConstants.Spacing.M }}
          onPress={() => {
            if (emojisState.targetIndex !== -1) {
              emojisState.inputProps[emojisState.targetIndex].ref?.current?.focus()
            }
            emojisDispatch({ type: 'target', payload: -1 })
          }}
        >
          <Icon name='chevron-down' size={StyleConstants.Font.Size.L} color={colors.secondary} />
        </Pressable>
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
                  data: emojis.current
                    ? chunk(
                        emojis.current
                          .filter(e => e.type !== 'frequent')
                          .flatMap(e =>
                            e.data.flatMap(e => e).filter(emoji => emoji.shortcode.includes(search))
                          ),
                        2
                      )
                    : []
                }
              ]
            : emojis.current || []
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
}

export default EmojisList
