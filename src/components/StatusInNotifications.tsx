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
import Actions from './Status/Actions'

export interface Props {
  status: mastodon.Notification
}

const TootNotification: React.FC<Props> = ({ status }) => {
  const navigation = useNavigation()
  const actualAccount = status.status ? status.status.account : status.account

  const statusView = useMemo(() => {
    return (
      <View style={styles.statusView}>
        <Actioned
          action={status.type}
          name={status.account.display_name || status.account.username}
          emojis={status.account.emojis}
          notification
        />

        <View style={styles.status}>
          <Avatar uri={actualAccount.avatar} id={actualAccount.id} />
          <View style={styles.details}>
            <Header
              name={actualAccount.display_name || actualAccount.username}
              emojis={actualAccount.emojis}
              account={actualAccount.acct}
              created_at={status.created_at}
            />
            <Pressable
              onPress={() => navigation.navigate('Toot', { toot: status.id })}
            >
              {status.status ? (
                <>
                  {status.status.content && (
                    <Content
                      content={status.status.content}
                      emojis={status.status.emojis}
                      mentions={status.status.mentions}
                      spoiler_text={status.status.spoiler_text}
                      // tags={status.status.tags}
                      // style={{ flex: 1 }}
                    />
                  )}
                  {status.status.poll && <Poll poll={status.status.poll} />}
                  {status.status.media_attachments.length > 0 && (
                    <Attachment
                      media_attachments={status.status.media_attachments}
                      sensitive={status.status.sensitive}
                      width={Dimensions.get('window').width - 24 - 50 - 8}
                    />
                  )}
                  {status.status.card && <Card card={status.status.card} />}
                </>
              ) : (
                <></>
              )}
            </Pressable>
            {status.status && (
              <Actions
                id={status.status.id}
                url={status.status.url}
                replies_count={status.status.replies_count}
                reblogs_count={status.status.reblogs_count}
                reblogged={status.status.reblogged}
                favourites_count={status.status.favourites_count}
                favourited={status.status.favourited}
                bookmarked={status.status.bookmarked}
              />
            )}
          </View>
        </View>
      </View>
    )
  }, [status])

  return statusView
}

const styles = StyleSheet.create({
  statusView: {
    flex: 1,
    flexDirection: 'column',
    padding: 12
  },
  status: {
    flex: 1,
    flexDirection: 'row'
  },
  details: {
    flex: 1,
    flexGrow: 1
  }
})

export default TootNotification
