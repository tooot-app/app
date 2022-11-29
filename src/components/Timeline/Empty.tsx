import Button from '@components/Button'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
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

    const { colors } = useTheme()
    const { t } = useTranslation('componentTimeline')

    const children = () => {
      switch (status) {
        case 'loading':
          return <Circle size={StyleConstants.Font.Size.L} color={colors.secondary} />
        case 'error':
          return (
            <>
              <Icon name='Frown' size={StyleConstants.Font.Size.L} color={colors.primaryDefault} />
              <CustomText
                fontStyle='M'
                style={{
                  marginTop: StyleConstants.Spacing.S,
                  marginBottom: StyleConstants.Spacing.L,
                  color: colors.primaryDefault
                }}
              >
                {t('empty.error.message')}
              </CustomText>
              <Button type='text' content={t('empty.error.button')} onPress={() => refetch()} />
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
              <CustomText
                fontStyle='M'
                style={{
                  marginTop: StyleConstants.Spacing.S,
                  marginBottom: StyleConstants.Spacing.L,
                  color: colors.primaryDefault
                }}
              >
                {t('empty.success.message')}
              </CustomText>
            </>
          )
      }
    }
    return (
      <View
        style={{
          flex: 1,
          minHeight: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.backgroundDefault
        }}
      >
        {children()}
      </View>
    )
  },
  () => true
)

export default TimelineEmpty
