import haptics from '@components/haptics'
import CustomText from '@components/Text'
import { useAppDispatch } from '@root/store'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { countInstanceEmoji } from '@utils/slices/instancesSlice'
import { getSettingsStaticEmoji } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useCallback, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  findNodeHandle,
  Image,
  Pressable,
  SectionList,
  View
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSelector } from 'react-redux'
import validUrl from 'valid-url'
import updateText from '../../updateText'
import ComposeContext from '../../utils/createContext'

export interface Props {
  accessibleRefEmojis: RefObject<SectionList>
}

const ComposeEmojis: React.FC<Props> = ({ accessibleRefEmojis }) => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { reduceMotionEnabled } = useAccessibility()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const staticEmoji = useSelector(getSettingsStaticEmoji)

  useEffect(() => {
    const tagEmojis = findNodeHandle(accessibleRefEmojis.current)
    if (composeState.emoji.active) {
      tagEmojis && AccessibilityInfo.setAccessibilityFocus(tagEmojis)
    }
  }, [composeState.emoji.active])

  const listHeader = useCallback(
    ({ section: { title } }) => (
      <CustomText
        fontStyle='S'
        style={{
          position: 'absolute',
          left: StyleConstants.Spacing.L,
          color: colors.secondary
        }}
      >
        {title}
      </CustomText>
    ),
    []
  )

  const listItem = useCallback(
    ({ index, item }: { item: Mastodon.Emoji[]; index: number }) => {
      return (
        <View
          key={index}
          style={{
            flex: 1,
            flexWrap: 'wrap',
            marginTop: StyleConstants.Spacing.M,
            marginLeft: StyleConstants.Spacing.M
          }}
        >
          {item.map(emoji => {
            const uri = reduceMotionEnabled ? emoji.static_url : emoji.url
            if (validUrl.isHttpsUri(uri)) {
              return (
                <Pressable
                  key={emoji.shortcode}
                  onPress={() => {
                    haptics('Light')
                    updateText({
                      composeState,
                      composeDispatch,
                      newText: `:${emoji.shortcode}:`,
                      type: 'emoji'
                    })
                    dispatch(countInstanceEmoji(emoji))
                  }}
                >
                  {staticEmoji ? (
                    <Image
                      accessibilityLabel={t(
                        'common:customEmoji.accessibilityLabel',
                        {
                          emoji: emoji.shortcode
                        }
                      )}
                      accessibilityHint={t(
                        'screenCompose:content.root.footer.emojis.accessibilityHint'
                      )}
                      source={{ uri }}
                      style={{
                        width: 32,
                        height: 32,
                        padding: StyleConstants.Spacing.S,
                        margin: StyleConstants.Spacing.S
                      }}
                    />
                  ) : (
                    <FastImage
                      accessibilityLabel={t(
                        'common:customEmoji.accessibilityLabel',
                        {
                          emoji: emoji.shortcode
                        }
                      )}
                      accessibilityHint={t(
                        'screenCompose:content.root.footer.emojis.accessibilityHint'
                      )}
                      source={{ uri }}
                      style={{
                        width: 32,
                        height: 32,
                        padding: StyleConstants.Spacing.S,
                        margin: StyleConstants.Spacing.S
                      }}
                    />
                  )}
                </Pressable>
              )
            } else {
              return null
            }
          })}
        </View>
      )
    },
    [composeState]
  )

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        height: 260
      }}
    >
      <SectionList
        accessible
        ref={accessibleRefEmojis}
        horizontal
        keyboardShouldPersistTaps='always'
        sections={composeState.emoji.emojis || []}
        keyExtractor={item => item[0].shortcode}
        renderSectionHeader={listHeader}
        renderItem={listItem}
        windowSize={2}
      />
    </View>
  )
}

export default React.memo(ComposeEmojis, () => true)
