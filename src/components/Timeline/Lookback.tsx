import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

const TimelineLookback = React.memo(
  () => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          padding: StyleConstants.Spacing.S,
          backgroundColor: colors.backgroundDefault
        }}
      >
        <Text
          style={{
            ...StyleConstants.FontStyle.S,
            color: colors.primaryDefault
          }}
        >
          {t('lookback.message')}
        </Text>
      </View>
    )
  },
  () => true
)

export default TimelineLookback
