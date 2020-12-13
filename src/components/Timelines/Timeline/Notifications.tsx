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
  queryKey: App.QueryKey
}

const TimelineNotifications: React.FC<Props> = ({ notification, queryKey }) => {
  const navigation = useNavigation()
  const actualAccount = notification.status
    ? notification.status.account
    : notification.account
  const contentWidth =
    Dimensions.get('window').width -
    StyleConstants.Spacing.Global.PagePadding * 2 - // Global page padding on both sides
    StyleConstants.Avatar.S - // Avatar width
    StyleConstants.Spacing.S // Avatar margin to the right

  const tootOnPress = useCallback(
    () =>
      navigation.navigate('Screen-Shared-Toot', {
        toot: notification
      }),
    []
  )
  const tootChildren = useMemo(
    () =>
      notification.status ? (
        <>
          {notification.status.content.length > 0 && (
            <TimelineContent status={notification.status} />
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
        </>
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

      <View style={styles.notification}>
        <TimelineAvatar account={actualAccount} />
        <View style={styles.details}>
          <TimelineHeaderNotification notification={notification} />
          <Pressable onPress={tootOnPress} children={tootChildren} />
          {notification.status && (
            <TimelineActions queryKey={queryKey} status={notification.status} />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  notificationView: {
    flex: 1,
    flexDirection: 'column',
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  notification: {
    flex: 1,
    flexDirection: 'row'
  },
  details: {
    flex: 1,
    flexGrow: 1
  }
})

export default TimelineNotifications
