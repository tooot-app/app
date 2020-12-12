import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import TimelineAvatar from './Shared/Avatar'
import TimelineHeaderConversation from './Shared/HeaderConversation'
import TimelineContent from './Shared/Content'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  item: Mastodon.Conversation
}
// Unread and mark as unread
const TimelineConversation: React.FC<Props> = ({ item }) => {
  const navigation = useNavigation()

  return (
    <View style={styles.statusView}>
      <View style={styles.status}>
        <TimelineAvatar account={item.accounts[0]} />
        <View style={styles.details}>
          <TimelineHeaderConversation
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
              <TimelineContent status={item.last_status} />
            ) : (
              <></>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  )
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
