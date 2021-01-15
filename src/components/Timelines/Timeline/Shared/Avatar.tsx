import React, { useCallback } from 'react'
import { StyleConstants } from '@utils/styles/constants'
import { useNavigation } from '@react-navigation/native'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import GracefullyImage from '@components/GracefullyImage'

export interface Props {
  queryKey?: QueryKeyTimeline
  account: Mastodon.Account
}

const TimelineAvatar: React.FC<Props> = ({ queryKey, account }) => {
  const navigation = useNavigation()
  // Need to fix go back root
  const onPress = useCallback(() => {
    queryKey && navigation.push('Screen-Shared-Account', { account })
  }, [])

  return (
    <GracefullyImage
      cache
      onPress={onPress}
      uri={{ original: account.avatar_static }}
      dimension={{
        width: StyleConstants.Avatar.M,
        height: StyleConstants.Avatar.M
      }}
      style={{
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: StyleConstants.Spacing.S
      }}
    />
  )
}

export default React.memo(TimelineAvatar, () => true)
