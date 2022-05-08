import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Trans } from 'react-i18next'
import { View } from 'react-native'
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
        notifyOnChangeProps: ['hasNextPage'],
        getNextPageParam: lastPage =>
          lastPage?.links?.next && { max_id: lastPage.links.next }
      }
    })

    const { colors } = useTheme()

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          padding: StyleConstants.Spacing.M
        }}
      >
        {!disableInfinity && hasNextPage ? (
          <Circle size={StyleConstants.Font.Size.L} color={colors.secondary} />
        ) : (
          <CustomText fontStyle='S' style={{ color: colors.secondary }}>
            <Trans
              i18nKey='componentTimeline:end.message'
              components={[
                <Icon
                  name='Coffee'
                  size={StyleConstants.Font.Size.S}
                  color={colors.secondary}
                />
              ]}
            />
          </CustomText>
        )}
      </View>
    )
  },
  () => true
)

export default TimelineFooter
