import { ParseHTML } from '@components/Parse'
import CustomText from '@components/Text'
import detectLanguage from '@helpers/detectLanguage'
import getLanguage from '@helpers/getLanguage'
import { useTranslateQuery } from '@utils/queryHooks/translate'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import StatusContext from './Context'

const TimelineTranslate = () => {
  const { status, highlighted, copiableContent } = useContext(StatusContext)
  if (!status || !highlighted) return null

  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  const backupTextProcessing = (): string[] => {
    const text = status.spoiler_text ? [status.spoiler_text, status.content] : [status.content]

    for (const i in text) {
      for (const emoji of status.emojis) {
        text[i] = text[i].replaceAll(`:${emoji.shortcode}:`, ' ')
      }
      text[i] = text[i]
        .replace(/(<([^>]+)>)/gi, ' ')
        .replace(/@.*? /gi, ' ')
        .replace(/#.*? /gi, ' ')
        .replace(/http(s):\/\/.*? /gi, ' ')
    }
    return text
  }
  const text = copiableContent?.current.content
    ? [copiableContent?.current.content]
    : backupTextProcessing()

  const [detectedLanguage, setDetectedLanguage] = useState<{
    language: string
    confidence: number
  }>({ language: status.language || '', confidence: 0 })
  useEffect(() => {
    const detect = async () => {
      const result = await detectLanguage(text.join('\n\n'))
      result && setDetectedLanguage(result)
    }
    detect()
  }, [])

  const settingsLanguage = getLanguage()
  const targetLanguage = settingsLanguage?.startsWith('en')
    ? Localization.locale || settingsLanguage || 'en'
    : settingsLanguage || Localization.locale || 'en'

  const [enabled, setEnabled] = useState(false)
  const { refetch, data, isLoading, isSuccess, isError } = useTranslateQuery({
    source: detectedLanguage.language,
    target: targetLanguage,
    text,
    options: { enabled }
  })

  const devView = () => {
    return __DEV__ ? (
      <CustomText fontStyle='S' style={{ color: colors.secondary }}>{` Source: ${
        detectedLanguage?.language
      }; Confidence: ${
        detectedLanguage?.confidence.toString().slice(0, 5) || 'null'
      }; Target: ${targetLanguage}`}</CustomText>
    ) : null
  }

  if (!detectedLanguage) {
    return devView()
  }
  if (
    Platform.OS === 'ios' &&
    Localization.locale.slice(0, 2).includes(detectedLanguage.language.slice(0, 2))
  ) {
    return devView()
  }
  if (
    Platform.OS === 'android' &&
    settingsLanguage?.slice(0, 2).includes(detectedLanguage.language.slice(0, 2))
  ) {
    return devView()
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
              refetch()
            }
          } else {
            setEnabled(true)
          }
        }}
      >
        <CustomText
          fontStyle='M'
          style={{
            color: isLoading || isSuccess ? colors.secondary : isError ? colors.red : colors.blue
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
        {isLoading ? (
          <Circle
            size={StyleConstants.Font.Size.M}
            color={colors.disabled}
            style={{ marginLeft: StyleConstants.Spacing.S }}
          />
        ) : null}
      </Pressable>
      {devView()}
      {data && data.error === undefined
        ? data.text.map((d, i) => <ParseHTML key={i} content={d} size={'M'} numberOfLines={999} />)
        : null}
    </>
  )
}

export default TimelineTranslate
