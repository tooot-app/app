import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export interface Props {
  queryKey?: QueryKeyTimeline
  account: Mastodon.Account
  highlighted: boolean
}

const TimelineAvatar = React.memo(
  ({ queryKey, account, highlighted }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const navigation = useNavigation<
      StackNavigationProp<Nav.TabLocalStackParamList>
    >()
    // Need to fix go back root
    const onPress = useCallback(() => {
      analytics('timeline_shared_avatar_press', {
        page: queryKey && queryKey[1].page
      })
      queryKey && navigation.push('Tab-Shared-Account', { account })
    }, [])

    return (
      <GracefullyImage
        {...(highlighted && {
          accessibilityLabel: t('shared.avatar.accessibilityLabel', {
            name: account.display_name
          }),
          accessibilityHint: t('shared.avatar.accessibilityHint', {
            name: account.display_name
          })
        })}
        onPress={onPress}
        uri={{ original: account.avatar_static }}
        dimension={{
          width: StyleConstants.Avatar.M,
          height: StyleConstants.Avatar.M
        }}
        style={{
          borderRadius: StyleConstants.Avatar.M,
          overflow: 'hidden',
          marginRight: StyleConstants.Spacing.S
        }}
      />
    )
  },
  () => true
)

export default TimelineAvatar
