import analytics from '@components/analytics'
import { ParseHTML } from '@components/Parse'
import CustomText from '@components/Text'
import { useTranslateQuery } from '@utils/queryHooks/translate'
import { getSettingsLanguage } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import detectLanguage from 'react-native-language-detection'
import { useSelector } from 'react-redux'

export interface Props {
  highlighted: boolean
  status: Pick<
    Mastodon.Status,
    'language' | 'spoiler_text' | 'content' | 'emojis'
  >
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
    const { colors } = useTheme()

    let text = status.spoiler_text
      ? [status.spoiler_text, status.content]
      : [status.content]

    for (const i in text) {
      for (const emoji of status.emojis) {
        text[i] = text[i].replaceAll(`:${emoji.shortcode}:`, '')
      }
    }

    const [detectedLanguage, setDetectedLanguage] = useState<string>('')
    useEffect(() => {
      if (!status.language) {
        return
      }

      const detect = async () => {
        const result = await detectLanguage(text.join(`\n`))
        setDetectedLanguage(result.detected.slice(0, 2))
      }
      detect()
    }, [])

    const settingsLanguage = useSelector(getSettingsLanguage)

    const [enabled, setEnabled] = useState(false)
    const { refetch, data, isLoading, isSuccess, isError } = useTranslateQuery({
      source: detectedLanguage,
      target: Localization.locale || settingsLanguage || 'en',
      text,
      options: { enabled }
    })

    if (!detectedLanguage) {
      return null
    }
    if (Localization.locale.includes(detectedLanguage)) {
      return null
    }
    if (settingsLanguage?.includes(detectedLanguage)) {
      return null
    }

    return (
      <>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: StyleConstants.Spacing.S,
            paddingBottom: isSuccess ? 0 : undefined
          }}
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
          <CustomText
            fontStyle='M'
            style={{
              color:
                isLoading || isSuccess
                  ? colors.secondary
                  : isError
                  ? colors.red
                  : colors.blue
            }}
          >
            {isError
              ? t('shared.translate.failed')
              : isSuccess
              ? typeof data?.error === 'string'
                ? t(`shared.translate.${data.error}`)
                : t('shared.translate.succeed', {
                    provider: data?.provider,
                    source: data?.sourceLanguage
                  })
              : t('shared.translate.default')}
          </CustomText>
          <CustomText>
            {__DEV__
              ? ` Source: ${status.language}; Target: ${
                  Localization.locale || settingsLanguage || 'en'
                }`
              : undefined}
          </CustomText>
          {isLoading ? (
            <Circle
              size={StyleConstants.Font.Size.M}
              color={colors.disabled}
              style={{ marginLeft: StyleConstants.Spacing.S }}
            />
          ) : null}
        </Pressable>
        {data && data.error === undefined
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
  (prev, next) =>
    prev.status.language === next.status.language &&
    prev.status.content === next.status.content &&
    prev.status.spoiler_text === next.status.spoiler_text
)

export default TimelineTranslate
