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
  status: mastodon.Status
  queryKey: store.QueryKey
}

const StatusInTimeline: React.FC<Props> = ({ status, queryKey }) => {
  const navigation = useNavigation()

  let actualContent = status.reblog ? status.reblog : status

  const statusView = useMemo(() => {
    return (
      <View style={styles.statusView}>
        {status.reblog && (
          <Actioned
            action='reblog'
            name={status.account.display_name || status.account.username}
            emojis={status.account.emojis}
          />
        )}
        <View style={styles.status}>
          <Avatar
            uri={actualContent.account.avatar}
            id={actualContent.account.id}
          />
          <View style={styles.details}>
            <Header
              name={
                actualContent.account.display_name ||
                actualContent.account.username
              }
              emojis={actualContent.account.emojis}
              account={actualContent.account.acct}
              created_at={status.created_at}
              application={status.application}
            />
            {/* Can pass toot info to next page to speed up performance */}
            <Pressable
              onPress={() =>
                navigation.navigate('Toot', { toot: actualContent.id })
              }
            >
              {actualContent.content ? (
                <Content
                  content={actualContent.content}
                  emojis={actualContent.emojis}
                  mentions={actualContent.mentions}
                  spoiler_text={actualContent.spoiler_text}
                  // tags={actualContent.tags}
                  // style={{ flex: 1 }}
                />
              ) : (
                <></>
              )}
              {actualContent.poll && <Poll poll={actualContent.poll} />}
              {actualContent.media_attachments.length > 0 && (
                <Attachment
                  media_attachments={actualContent.media_attachments}
                  sensitive={actualContent.sensitive}
                  width={Dimensions.get('window').width - 24 - 50 - 8}
                />
              )}
              {actualContent.card && <Card card={actualContent.card} />}
            </Pressable>
            <Actions
              queryKey={queryKey}
              id={actualContent.id}
              url={actualContent.url}
              replies_count={actualContent.replies_count}
              reblogs_count={actualContent.reblogs_count}
              reblogged={actualContent.reblogged}
              favourites_count={actualContent.favourites_count}
              favourited={actualContent.favourited}
              bookmarked={actualContent.bookmarked}
            />
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

export default StatusInTimeline
