import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import StatusContext from './Context'

export interface Props {
  account?: Mastodon.Account
}

const TimelineAvatar: React.FC<Props> = ({ account }) => {
  const { status, highlighted, disableDetails, disableOnPress, isConversation, inThread } =
    useContext(StatusContext)
  const actualAccount = account || status?.account
  if (!actualAccount) return null

  const { t } = useTranslation('componentTimeline')
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  return (
    <GracefullyImage
      {...(highlighted && {
        accessibilityLabel: t('shared.avatar.accessibilityLabel', {
          name: actualAccount.display_name
        }),
        accessibilityHint: t('shared.avatar.accessibilityHint', {
          name: actualAccount.display_name
        })
      })}
      onPress={() =>
        !disableOnPress && navigation.push('Tab-Shared-Account', { account: actualAccount })
      }
      sources={{
        default: { uri: actualAccount.avatar },
        static: { uri: actualAccount.avatar_static }
      }}
      dimension={
        disableDetails || isConversation
          ? {
              width: StyleConstants.Avatar.XS,
              height: StyleConstants.Avatar.XS
            }
          : {
              width: StyleConstants.Avatar.M,
              height: StyleConstants.Avatar.M
            }
      }
      style={{
        borderRadius: 99,
        overflow: 'hidden',
        marginRight: StyleConstants.Spacing.S
      }}
      dim
      withoutTransition={inThread}
    />
  )
}

export default TimelineAvatar
