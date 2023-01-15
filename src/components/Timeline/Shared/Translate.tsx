import { Loading } from '@components/Loading'
import { ParseHTML } from '@components/Parse'
import CustomText from '@components/Text'
import detectLanguage from '@utils/helpers/detectLanguage'
import getLanguage from '@utils/helpers/getLanguage'
import { useTranslateQuery } from '@utils/queryHooks/translate'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import StatusContext from './Context'

const TimelineTranslate = () => {
  const { status, highlighted, rawContent, detectedLanguage } = useContext(StatusContext)
  if (!status || !highlighted || !rawContent?.current.length) return null

  const { t } = useTranslation(['componentTimeline'])
  const { colors } = useTheme()

  const [detected, setDetected] = useState<{
    language: string
    confidence: number
  }>({ language: status.language || '', confidence: 0 })
  useEffect(() => {
    const detect = async () => {
      const result = await detectLanguage(rawContent.current.join('\n\n'))
      if (result) {
        setDetected(result)
        if (detectedLanguage) {
          detectedLanguage.current = result.language
        }
      }
    }
    detect()
  }, [])

  const settingsLanguage = getLanguage()
  const targetLanguage = settingsLanguage?.startsWith('en')
    ? Localization.locale || settingsLanguage || 'en'
    : settingsLanguage || Localization.locale || 'en'

  const [enabled, setEnabled] = useState(false)
  const { refetch, data, isFetching, isSuccess, isError } = useTranslateQuery({
    source: detected.language,
    target: targetLanguage,
    text: rawContent.current,
    options: { enabled }
  })

  const devView = () => {
    return __DEV__ ? (
      <CustomText fontStyle='S' style={{ color: colors.secondary }}>{` Source: ${
        detected?.language
      }; Confidence: ${
        detected?.confidence?.toString().slice(0, 5) || 'null'
      }; Target: ${targetLanguage}`}</CustomText>
    ) : null
  }

  if (!detectedLanguage) {
    return devView()
  }
  if (
    Platform.OS === 'ios' &&
    Localization.locale.slice(0, 2).includes(detected.language.slice(0, 2))
  ) {
    return devView()
  }
  if (
    Platform.OS === 'android' &&
    settingsLanguage?.slice(0, 2).includes(detected.language.slice(0, 2))
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
            color: isFetching || isSuccess ? colors.secondary : isError ? colors.red : colors.blue
          }}
        >
          {isError
            ? t('componentTimeline:shared.translate.failed')
            : isSuccess
            ? typeof data?.error === 'string'
              ? t(`componentTimeline:shared.translate.${data.error}` as any)
              : t('componentTimeline:shared.translate.succeed', {
                  provider: data?.provider,
                  source: data?.sourceLanguage
                })
            : t('componentTimeline:shared.translate.default')}
        </CustomText>
        {isFetching ? <Loading style={{ marginLeft: StyleConstants.Spacing.S }} /> : null}
      </Pressable>
      {devView()}
      {data && data.error === undefined
        ? data.text.map((d, i) => <ParseHTML key={i} content={d} size={'M'} numberOfLines={999} />)
        : null}
    </>
  )
}

export default TimelineTranslate
