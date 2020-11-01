import React, { useMemo } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Actioned from './Toot/Actioned'
import Avatar from './Toot/Avatar'
import Header from './Toot/Header'
import Content from './Toot/Content'
import Poll from './Toot/Poll'
import Attachment from './Toot/Attachment'
import Card from './Toot/Card'
import Actions from './Toot/Actions'

export interface Props {
  toot: mastodon.Status
}

const TootTimeline: React.FC<Props> = ({ toot }) => {
  const navigation = useNavigation()

  let actualContent = toot.reblog ? toot.reblog : toot

  const tootView = useMemo(() => {
    return (
      <View style={styles.tootTimeline}>
        {toot.reblog && (
          <Actioned
            action='reblog'
            name={toot.account.display_name || toot.account.username}
            emojis={toot.account.emojis}
          />
        )}
        <View style={styles.toot}>
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
              created_at={toot.created_at}
              application={toot.application}
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
  }, [toot])

  return tootView
}

const styles = StyleSheet.create({
  tootTimeline: {
    flex: 1,
    flexDirection: 'column',
    padding: 12
  },
  toot: {
    flex: 1,
    flexDirection: 'row'
  },
  details: {
    flex: 1,
    flexGrow: 1
  }
})

export default TootTimeline
