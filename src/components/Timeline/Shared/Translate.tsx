import analytics from '@components/analytics'
import { ParseHTML } from '@components/Parse'
import { useTranslateQuery } from '@utils/queryHooks/translate'
import { getSettingsLanguage } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import { useSelector } from 'react-redux'

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

    const settingsLanguage = useSelector(getSettingsLanguage)

    if (settingsLanguage?.includes(tootLanguage)) {
      return null
    }

    let text = status.spoiler_text
      ? [status.spoiler_text, status.content]
      : [status.content]

    for (const i in text) {
      for (const emoji of status.emojis) {
        text[i] = text[i].replaceAll(`:${emoji.shortcode}:`, '')
      }
    }

    const [enabled, setEnabled] = useState(false)
    const { refetch, data, isLoading, isSuccess, isError } = useTranslateQuery({
      source: status.language,
      target: settingsLanguage,
      text,
      options: { enabled }
    })

    return (
      <>
        <Pressable
          style={[styles.button, { paddingBottom: isSuccess ? 0 : undefined }]}
          onPress={() => {
            if (enabled) {
              if (!isSuccess) {
                analytics('timeline_shared_translate_retry', {
                  language: status.language
                })
                refetch()
              }
            } else {
              analytics('timeline_shared_translate', {
                language: status.language
              })
              setEnabled(true)
            }
          }}
        >
          <Text
            style={{
              ...StyleConstants.FontStyle.M,
              color:
                isLoading || isSuccess
                  ? theme.secondary
                  : isError
                  ? theme.red
                  : theme.blue
            }}
          >
            {isError
              ? t('shared.translate.failed')
              : isSuccess
              ? t('shared.translate.succeed', {
                  provider: data?.provider,
                  source: data?.sourceLanguage
                })
              : t('shared.translate.default')}
            {__DEV__ ? ` Source: ${status.language}` : undefined}
          </Text>
          {isLoading ? (
            <Circle
              size={StyleConstants.Font.Size.M}
              color={theme.disabled}
              style={{ marginLeft: StyleConstants.Spacing.S }}
            />
          ) : null}
        </Pressable>
        {data
          ? data.text.map((d, i) => (
              <ParseHTML
                key={i}
                content={d}
                size={'M'}
                numberOfLines={999}
                selectable
              />
            ))
          : null}
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
