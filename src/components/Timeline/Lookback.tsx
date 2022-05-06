import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

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
        <CustomText fontStyle='S' style={{ color: colors.primaryDefault }}>
          {t('lookback.message')}
        </CustomText>
      </View>
    )
  },
  () => true
)

export default TimelineLookback
