import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

const TimelineLookback = React.memo(
  () => {
    const { t } = useTranslation('componentTimeline')
    const { theme } = useTheme()

    return (
      <View style={[styles.base, { backgroundColor: theme.backgroundDefault }]}>
        <Text
          style={[StyleConstants.FontStyle.S, { color: theme.primaryDefault }]}
        >
          {t('lookback.message')}
        </Text>
      </View>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: StyleConstants.Spacing.S
  },
  text: {
    ...StyleConstants.FontStyle.S
  }
})

export default TimelineLookback
