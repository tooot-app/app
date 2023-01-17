import Icon from '@components/Icon'
import { Loading } from '@components/Loading'
import CustomText from '@components/Text'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Trans } from 'react-i18next'
import { View } from 'react-native'

export interface Props {
  queryKey: QueryKeyTimeline
  disableInfinity: boolean
}

const TimelineFooter: React.FC<Props> = ({ queryKey, disableInfinity }) => {
  const { hasNextPage } = useTimelineQuery({
    ...queryKey[1],
    options: { enabled: !disableInfinity, notifyOnChangeProps: ['hasNextPage'] }
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
        <Loading />
      ) : (
        <CustomText fontStyle='S' style={{ color: colors.secondary }}>
          <Trans
            ns='componentTimeline'
            i18nKey='end.message'
            components={[
              <Icon name='Coffee' size={StyleConstants.Font.Size.S} color={colors.secondary} />
            ]}
          />
        </CustomText>
      )}
    </View>
  )
}

export default TimelineFooter
