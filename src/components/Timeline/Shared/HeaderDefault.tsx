import Icon from '@components/Icon'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedVisibility from './HeaderShared/Visibility'

export interface Props {
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  status: Mastodon.Status
  highlighted: boolean
}

const TimelineHeaderDefault = ({
  queryKey,
  rootQueryKey,
  status,
  highlighted
}: Props) => {
  const { t } = useTranslation('componentTimeline')
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { colors } = useTheme()

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 5 }}>
        <HeaderSharedAccount account={status.account} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: StyleConstants.Spacing.XS,
            marginBottom: StyleConstants.Spacing.S
          }}
        >
          <HeaderSharedCreated
            created_at={status.created_at}
            edited_at={status.edited_at}
            highlighted={highlighted}
          />
          <HeaderSharedVisibility visibility={status.visibility} />
          <HeaderSharedMuted muted={status.muted} />
          <HeaderSharedApplication application={status.application} />
        </View>
      </View>

      {queryKey ? (
        <Pressable
          accessibilityHint={t('shared.header.actions.accessibilityHint')}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            paddingBottom: StyleConstants.Spacing.S
          }}
          onPress={() =>
            navigation.navigate('Screen-Actions', {
              queryKey,
              rootQueryKey,
              status,
              type: 'status'
            })
          }
          children={
            <Icon
              name='MoreHorizontal'
              color={colors.secondary}
              size={StyleConstants.Font.Size.L}
            />
          }
        />
      ) : null}
    </View>
  )
}

export default TimelineHeaderDefault
