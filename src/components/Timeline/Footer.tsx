import Icon from '@components/Icon'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Trans } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'

export interface Props {
  queryKey: QueryKeyTimeline
  disableInfinity: boolean
}

const TimelineFooter = React.memo(
  ({ queryKey, disableInfinity }: Props) => {
    const { hasNextPage } = useTimelineQuery({
      ...queryKey[1],
      options: {
        enabled: !disableInfinity,
        notifyOnChangeProps: ['hasNextPage']
      }
    })

    const { theme } = useTheme()

    return (
      <View style={styles.base}>
        {!disableInfinity && hasNextPage ? (
          <Circle size={StyleConstants.Font.Size.L} color={theme.secondary} />
        ) : (
          <Text style={[styles.text, { color: theme.secondary }]}>
            <Trans
              i18nKey='componentTimeline:end.message'
              components={[
                <Icon
                  name='Coffee'
                  size={StyleConstants.Font.Size.S}
                  color={theme.secondary}
                />
              ]}
            />
          </Text>
        )}
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
    padding: StyleConstants.Spacing.M
  },
  text: {
    ...StyleConstants.FontStyle.S
  }
})

export default TimelineFooter
