import analytics from '@components/analytics'
import Button from '@components/Button'
import Icon from '@components/Icon'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'

export interface Props {
  queryKey: QueryKeyTimeline
}

const TimelineEmpty = React.memo(
  ({ queryKey }: Props) => {
    const { status, refetch } = useTimelineQuery({
      ...queryKey[1],
      options: { notifyOnChangeProps: ['status'] }
    })

    const { colors, theme } = useTheme()
    const { t, i18n } = useTranslation('componentTimeline')

    const children = useMemo(() => {
      switch (status) {
        case 'loading':
          return (
            <Circle
              size={StyleConstants.Font.Size.L}
              color={colors.secondary}
            />
          )
        case 'error':
          return (
            <>
              <Icon
                name='Frown'
                size={StyleConstants.Font.Size.L}
                color={colors.primaryDefault}
              />
              <Text style={[styles.error, { color: colors.primaryDefault }]}>
                {t('empty.error.message')}
              </Text>
              <Button
                type='text'
                content={t('empty.error.button')}
                onPress={() => {
                  analytics('timeline_error_press_refetch')
                  refetch()
                }}
              />
            </>
          )
        case 'success':
          return (
            <>
              <Icon
                name='Smartphone'
                size={StyleConstants.Font.Size.L}
                color={colors.primaryDefault}
              />
              <Text style={[styles.error, { color: colors.primaryDefault }]}>
                {t('empty.success.message')}
              </Text>
            </>
          )
      }
    }, [theme, i18n.language, status])
    return (
      <View
        style={[styles.base, { backgroundColor: colors.backgroundDefault }]}
        children={children}
      />
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    ...StyleConstants.FontStyle.M,
    marginTop: StyleConstants.Spacing.S,
    marginBottom: StyleConstants.Spacing.L
  }
})

export default TimelineEmpty
