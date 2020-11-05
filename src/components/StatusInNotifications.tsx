import React, { useMemo } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Actioned from './Status/Actioned'
import Avatar from './Status/Avatar'
import Header from './Status/Header'
import Content from './Status/Content'
import Poll from './Status/Poll'
import Attachment from './Status/Attachment'
import Card from './Status/Card'
import ActionsStatus from './Status/ActionsStatus'

export interface Props {
  notification: mastodon.Notification
  queryKey: store.QueryKey
}

const TootNotification: React.FC<Props> = ({ notification, queryKey }) => {
  const navigation = useNavigation()
  const actualAccount = notification.status
    ? notification.status.account
    : notification.account

  const statusView = useMemo(() => {
    return (
      <View style={styles.notificationView}>
        <Actioned
          action={notification.type}
          name={
            notification.account.display_name || notification.account.username
          }
          emojis={notification.account.emojis}
          notification
        />

        <View style={styles.notification}>
          <Avatar uri={actualAccount.avatar} id={actualAccount.id} />
          <View style={styles.details}>
            <Header
              name={actualAccount.display_name || actualAccount.username}
              emojis={actualAccount.emojis}
              account={actualAccount.acct}
              created_at={notification.created_at}
            />
            <Pressable
              onPress={() =>
                navigation.navigate('Toot', { toot: notification.id })
              }
            >
              {notification.status ? (
                <>
                  {notification.status.content && (
                    <Content
                      content={notification.status.content}
                      emojis={notification.status.emojis}
                      mentions={notification.status.mentions}
                      spoiler_text={notification.status.spoiler_text}
                      // tags={notification.notification.tags}
                      // style={{ flex: 1 }}
                    />
                  )}
                  {notification.status.poll && (
                    <Poll poll={notification.status.poll} />
                  )}
                  {notification.status.media_attachments.length > 0 && (
                    <Attachment
                      media_attachments={notification.status.media_attachments}
                      sensitive={notification.status.sensitive}
                      width={Dimensions.get('window').width - 24 - 50 - 8}
                    />
                  )}
                  {notification.status.card && (
                    <Card card={notification.status.card} />
                  )}
                </>
              ) : (
                <></>
              )}
            </Pressable>
            {notification.status && (
              <ActionsStatus queryKey={queryKey} status={notification.status} />
            )}
          </View>
        </View>
      </View>
    )
  }, [notification])

  return statusView
}

const styles = StyleSheet.create({
  notificationView: {
    flex: 1,
    flexDirection: 'column',
    padding: 12
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

export default TootNotification
