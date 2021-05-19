import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useTranslateQuery } from '@utils/queryHooks/translate'
import { getSettingsLanguage } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
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

    const settingsLanguage = useSelector(getSettingsLanguage, () => true)
    const tootLanguage = status.language.slice(0, 2)

    if (settingsLanguage.includes(tootLanguage)) {
      return null
    }

    const { t } = useTranslation('componentTimeline')
    const { theme } = useTheme()

    const { data } = useTranslateQuery({
      toot: status.content,
      source: status.language,
      target: settingsLanguage.slice(0, 2)
    })

    return (
      <>
        <Text
          style={{
            ...StyleConstants.FontStyle.S,
            color: theme.blue,
            marginTop: StyleConstants.Font.Size.S
          }}
        >
          {t('shared.translate')}
        </Text>
        {data ? <Text children={data} /> : null}
      </>
    )
  },
  () => true
)

export default TimelineTranslate
