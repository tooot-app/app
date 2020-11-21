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
  item: Mastodon.Status
  queryKey: App.QueryKey
}

const TimelineDefault: React.FC<Props> = ({ item, queryKey }) => {
  const navigation = useNavigation()

  let actualStatus = item.reblog ? item.reblog : item

  const statusView = useMemo(() => {
    return (
      <View style={styles.statusView}>
        {item.reblog && (
          <Actioned
            action='reblog'
            name={item.account.display_name || item.account.username}
            emojis={item.account.emojis}
          />
        )}
        <View style={styles.status}>
          <Avatar
            uri={actualStatus.account.avatar}
            id={actualStatus.account.id}
          />
          <View style={styles.details}>
            <Header
              queryKey={queryKey}
              accountId={actualStatus.account.id}
              domain={actualStatus.uri.split(new RegExp(/\/\/(.*?)\//))[1]}
              name={
                actualStatus.account.display_name ||
                actualStatus.account.username
              }
              emojis={actualStatus.account.emojis}
              account={actualStatus.account.acct}
              created_at={item.created_at}
              application={item.application}
            />
            {/* Can pass toot info to next page to speed up performance */}
            <Pressable
              onPress={() =>
                navigation.navigate('Screen-Shared-Toot', {
                  toot: actualStatus.id
                })
              }
            >
              {actualStatus.content ? (
                <Content
                  content={actualStatus.content}
                  emojis={actualStatus.emojis}
                  mentions={actualStatus.mentions}
                  spoiler_text={actualStatus.spoiler_text}
                  // tags={actualStatus.tags}
                  // style={{ flex: 1 }}
                />
              ) : (
                <></>
              )}
              {actualStatus.poll && <Poll poll={actualStatus.poll} />}
              {actualStatus.media_attachments.length > 0 && (
                <Attachment
                  media_attachments={actualStatus.media_attachments}
                  sensitive={actualStatus.sensitive}
                  width={Dimensions.get('window').width - 24 - 50 - 8}
                />
              )}
              {actualStatus.card && <Card card={actualStatus.card} />}
            </Pressable>
            <ActionsStatus queryKey={queryKey} status={actualStatus} />
          </View>
        </View>
      </View>
    )
  }, [item])

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

export default TimelineDefault
