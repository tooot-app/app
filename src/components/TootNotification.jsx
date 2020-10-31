import React, { useMemo } from 'react'
import propTypesNotification from 'src/prop-types/notification'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Actioned from './Toot/Actioned'
import Avatar from './Toot/Avatar'
import Header from './Toot/Header'
import Content from './Toot/Content'
import Poll from './Toot/Poll'
import Attachment from './Toot/Attachment'
import Card from './Toot/Card'
import Actions from './Toot/Actions'

export default function TootNotification ({ toot }) {
  const navigation = useNavigation()
  const actualAccount = toot.status ? toot.status.account : toot.account

  const tootView = useMemo(() => {
    return (
      <View style={styles.tootNotification}>
        <Actioned
          action={toot.type}
          name={toot.account.display_name || toot.account.username}
          emojis={toot.account.emojis}
          notification
        />

        <View style={styles.toot}>
          <Avatar uri={actualAccount.avatar} id={actualAccount.id} />
          <View style={styles.details}>
            <Header
              name={actualAccount.display_name || actualAccount.username}
              emojis={actualAccount.emojis}
              account={actualAccount.acct}
              created_at={toot.created_at}
            />
            <Pressable
              onPress={() => navigation.navigate('Toot', { toot: toot.id })}
            >
              {toot.status ? (
                <>
                  {toot.status.content && (
                    <Content
                      content={toot.status.content}
                      emojis={toot.status.emojis}
                      mentions={toot.status.mentions}
                      spoiler_text={toot.status.spoiler_text}
                      tags={toot.status.tags}
                      style={{ flex: 1 }}
                    />
                  )}
                  {toot.status.poll && <Poll poll={toot.status.poll} />}
                  {toot.status.media_attachments.length > 0 && (
                    <Attachment
                      media_attachments={toot.status.media_attachments}
                      sensitive={toot.status.sensitive}
                      width={Dimensions.get('window').width - 24 - 50 - 8}
                    />
                  )}
                  {toot.status.card && <Card card={toot.status.card} />}
                </>
              ) : (
                <></>
              )}
            </Pressable>
            {toot.status && (
              <Actions
                id={toot.status.id}
                replies_count={toot.status.replies_count}
                reblogs_count={toot.status.reblogs_count}
                reblogged={toot.status.reblogged}
                favourites_count={toot.status.favourites_count}
                favourited={toot.status.favourited}
              />
            )}
          </View>
        </View>
      </View>
    )
  }, [toot])

  return tootView
}

const styles = StyleSheet.create({
  tootNotification: {
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

TootNotification.propTypes = {
  toot: propTypesNotification
}
