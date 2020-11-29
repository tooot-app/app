import React, { useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Avatar from './Shared/Avatar'
import HeaderConversation from './Shared/HeaderConversation'
import Content from './Shared/Content'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  item: Mastodon.Conversation
}
// Unread and mark as unread
const TimelineConversation: React.FC<Props> = ({ item }) => {
  const navigation = useNavigation()

  const statusView = useMemo(() => {
    return (
      <View style={styles.statusView}>
        <View style={styles.status}>
          <Avatar uri={item.accounts[0].avatar} id={item.accounts[0].id} />
          <View style={styles.details}>
            <HeaderConversation
              account={item.accounts[0]}
              created_at={item.last_status?.created_at}
            />
            {/* Can pass toot info to next page to speed up performance */}
            <Pressable
              onPress={() =>
                item.last_status &&
                navigation.navigate('Screen-Shared-Toot', {
                  toot: item.last_status.id
                })
              }
            >
              {item.last_status ? (
                <Content
                  content={item.last_status.content}
                  emojis={item.last_status.emojis}
                  mentions={item.last_status.mentions}
                  spoiler_text={item.last_status.spoiler_text}
                  // tags={actualStatus.tags}
                  // style={{ flex: 1 }}
                />
              ) : (
                <></>
              )}
            </Pressable>
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
    padding: StyleConstants.Spacing.Global.PagePadding
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

export default TimelineConversation
