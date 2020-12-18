import React, { useCallback, useMemo } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import TimelineActioned from '@components/Timelines/Timeline/Shared/Actioned'
import TimelineActions from '@components/Timelines/Timeline/Shared/Actions'
import TimelineAttachment from '@components/Timelines/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timelines/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timelines/Timeline/Shared/Card'
import TimelineContent from '@components/Timelines/Timeline/Shared/Content'
import TimelineHeaderNotification from '@components/Timelines/Timeline/Shared/HeaderNotification'
import TimelinePoll from '@components/Timelines/Timeline/Shared/Poll'

import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  notification: Mastodon.Notification
  queryKey: QueryKey.Timeline
  highlighted?: boolean
}

const TimelineNotifications: React.FC<Props> = ({
  notification,
  queryKey,
  highlighted = false
}) => {
  const navigation = useNavigation()
  const actualAccount = notification.status
    ? notification.status.account
    : notification.account
  const contentWidth = highlighted
    ? Dimensions.get('window').width -
      StyleConstants.Spacing.Global.PagePadding * 2 // Global page padding on both sides
    : Dimensions.get('window').width -
      StyleConstants.Spacing.Global.PagePadding * 2 - // Global page padding on both sides
      StyleConstants.Avatar.S - // Avatar width
      StyleConstants.Spacing.S // Avatar margin to the right

  const tootOnPress = useCallback(
    () =>
      navigation.navigate('Screen-Shared-Toot', {
        toot: notification.status
      }),
    []
  )
  const tootChildren = useMemo(
    () =>
      notification.status ? (
        <View
          style={{
            paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
            paddingLeft: highlighted
              ? 0
              : StyleConstants.Avatar.S + StyleConstants.Spacing.S
          }}
        >
          {notification.status.content.length > 0 && (
            <TimelineContent
              status={notification.status}
              highlighted={highlighted}
            />
          )}
          {notification.status.poll && (
            <TimelinePoll queryKey={queryKey} status={notification.status} />
          )}
          {notification.status.media_attachments.length > 0 && (
            <TimelineAttachment
              status={notification.status}
              width={contentWidth}
            />
          )}
          {notification.status.card && (
            <TimelineCard card={notification.status.card} />
          )}
        </View>
      ) : null,
    [notification.status?.poll?.voted]
  )

  return (
    <View style={styles.notificationView}>
      <TimelineActioned
        action={notification.type}
        account={notification.account}
        notification
      />

      <View style={styles.header}>
        <TimelineAvatar queryKey={queryKey} account={actualAccount} />
        <TimelineHeaderNotification notification={notification} />
      </View>

      <Pressable onPress={tootOnPress} children={tootChildren} />

      {notification.status && (
        <View
          style={{
            paddingLeft: highlighted
              ? 0
              : StyleConstants.Avatar.S + StyleConstants.Spacing.S
          }}
        >
          <TimelineActions queryKey={queryKey} status={notification.status} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  notificationView: {
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: StyleConstants.Spacing.M
  },
  header: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
  }
})

export default TimelineNotifications
