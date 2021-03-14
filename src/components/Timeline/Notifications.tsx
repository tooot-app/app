import analytics from '@components/analytics'
import TimelineActioned from '@components/Timeline/Shared/Actioned'
import TimelineActions from '@components/Timeline/Shared/Actions'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timeline/Shared/Card'
import TimelineContent from '@components/Timeline/Shared/Content'
import TimelineHeaderNotification from '@components/Timeline/Shared/HeaderNotification'
import TimelinePoll from '@components/Timeline/Shared/Poll'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { uniqBy } from 'lodash'
import React, { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import TimelineFullConversation from './Shared/FullConversation'

export interface Props {
  notification: Mastodon.Notification
  queryKey: QueryKeyTimeline
  highlighted?: boolean
}

const TimelineNotifications: React.FC<Props> = ({
  notification,
  queryKey,
  highlighted = false
}) => {
  const { theme } = useTheme()
  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev?.id === next?.id
  )
  const navigation = useNavigation<
    StackNavigationProp<Nav.TabLocalStackParamList>
  >()
  const actualAccount = notification.status
    ? notification.status.account
    : notification.account

  const onPress = useCallback(() => {
    analytics('timeline_notification_press')
    notification.status &&
      navigation.push('Tab-Shared-Toot', {
        toot: notification.status,
        rootQueryKey: queryKey
      })
  }, [])

  return (
    <Pressable
      style={[
        styles.notificationView,
        {
          backgroundColor: theme.background,
          paddingBottom: notification.status
            ? 0
            : StyleConstants.Spacing.Global.PagePadding
        }
      ]}
      onPress={onPress}
    >
      {notification.type !== 'mention' ? (
        <TimelineActioned
          action={notification.type}
          account={notification.account}
          notification
        />
      ) : null}

      <View
        style={{
          opacity:
            notification.type === 'follow' ||
            notification.type === 'follow_request' ||
            notification.type === 'mention' ||
            notification.type === 'status'
              ? 1
              : 0.5
        }}
      >
        <View style={styles.header}>
          <TimelineAvatar queryKey={queryKey} account={actualAccount} />
          <TimelineHeaderNotification
            queryKey={queryKey}
            notification={notification}
          />
        </View>

        {notification.status ? (
          <View
            style={{
              paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
              paddingLeft: highlighted
                ? 0
                : StyleConstants.Avatar.M + StyleConstants.Spacing.S
            }}
          >
            {notification.status.content.length > 0 && (
              <TimelineContent
                status={notification.status}
                highlighted={highlighted}
              />
            )}
            {notification.status.poll && (
              <TimelinePoll
                queryKey={queryKey}
                statusId={notification.status.id}
                poll={notification.status.poll}
                reblog={false}
                sameAccount={notification.account.id === instanceAccount?.id}
              />
            )}
            {notification.status.media_attachments.length > 0 && (
              <TimelineAttachment status={notification.status} />
            )}
            {notification.status.card && (
              <TimelineCard card={notification.status.card} />
            )}
            <TimelineFullConversation status={notification.status} />
          </View>
        ) : null}
      </View>

      {notification.status && (
        <View
          style={{
            paddingLeft: highlighted
              ? 0
              : StyleConstants.Avatar.M + StyleConstants.Spacing.S
          }}
        >
          <TimelineActions
            queryKey={queryKey}
            status={notification.status}
            accts={uniqBy(
              ([notification.status.account] as Mastodon.Account[] &
                Mastodon.Mention[])
                .concat(notification.status.mentions)
                .filter(d => d.id !== instanceAccount?.id),
              d => d.id
            ).map(d => d.acct)}
            reblog={false}
          />
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  notificationView: {
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  header: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
  }
})

export default TimelineNotifications
