import { useTranslateQuery } from '@utils/queryHooks/translate'
import { getSettingsLanguage } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import htmlparser2 from 'htmlparser2-without-node-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import { useSelector } from 'react-redux'

const availableLanguages = [
  'en',
  'ar',
  'zh',
  'fr',
  'de',
  'hi',
  'ga',
  'it',
  'ja',
  'ko',
  'pl',
  'pt',
  'ru',
  'es',
  'tr'
]

export interface Props {
  highlighted: boolean
  status: Mastodon.Status
}

const TimelineTranslate = React.memo(
  ({ highlighted, status }: Props) => {
    if (!highlighted) {
      return null
    }
    if (!status.language) {
      return null
    }

    const { t } = useTranslation('componentTimeline')
    const { theme } = useTheme()

    const tootLanguage = status.language.slice(0, 2)
    if (!availableLanguages.includes(tootLanguage)) {
      return (
        <Text
          style={{
            ...StyleConstants.FontStyle.M,
            color: theme.disabled
          }}
        >
          {t('shared.translate.unavailable')}
        </Text>
      )
    }

    const settingsLanguage = useSelector(getSettingsLanguage, () => true)

    if (settingsLanguage.includes(tootLanguage)) {
      return null
    }

    let emojisRemoved = status.spoiler_text
      ? status.spoiler_text.concat(status.content)
      : status.content
    if (status.emojis) {
      for (const emoji of status.emojis) {
        emojisRemoved = emojisRemoved.replaceAll(`:${emoji.shortcode}:`, '')
      }
    }

    let cleaned = ''
    const parser = new htmlparser2.Parser({
      ontext (text: string) {
        cleaned = cleaned.concat(text)
      }
    })
    parser.write(emojisRemoved)
    parser.end()

    const [enabled, setEnabled] = useState(false)
    const { refetch, data, isLoading, isSuccess, isError } = useTranslateQuery({
      toot: cleaned,
      source: status.language,
      target: settingsLanguage.slice(0, 2),
      options: { enabled }
    })

    return (
      <>
        <Pressable
          style={[styles.button, { paddingBottom: isSuccess ? 0 : undefined }]}
          onPress={() => {
            if (enabled) {
              if (!isSuccess) {
                refetch()
              }
            } else {
              setEnabled(true)
            }
          }}
        >
          <Text
            style={{
              ...StyleConstants.FontStyle.M,
              color:
                isLoading || isSuccess
                  ? theme.disabled
                  : isError
                  ? theme.red
                  : theme.blue
            }}
          >
            {isError
              ? t('shared.translate.error')
              : t('shared.translate.default')}
          </Text>
          {isLoading ? (
            <Circle
              size={StyleConstants.Font.Size.M}
              color={theme.disabled}
              style={{ marginLeft: StyleConstants.Spacing.S }}
            />
          ) : null}
        </Pressable>
        {data ? (
          <Text
            style={{
              ...StyleConstants.FontStyle.M,
              color: theme.primaryDefault
            }}
            children={data}
          />
        ) : null}
      </>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: StyleConstants.Spacing.S
  }
})

export default TimelineTranslate
