import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import TimelineAvatar from './Shared/Avatar'
import TimelineHeaderConversation from './Shared/HeaderConversation'
import TimelineContent from './Shared/Content'
import { StyleConstants } from 'src/utils/styles/constants'
import TimelineActions from './Shared/Actions'

export interface Props {
  item: Mastodon.Conversation
  queryKey: App.QueryKey
  highlighted?: boolean
}
// Unread and mark as unread
const TimelineConversation: React.FC<Props> = ({
  item,
  queryKey,
  highlighted = false
}) => {
  const navigation = useNavigation()

  const conversationOnPress = useCallback(
    () =>
      item.last_status &&
      navigation.navigate('Screen-Shared-Toot', {
        toot: item.last_status
      }),
    []
  )

  const conversationChildren = useMemo(() => {
    return item.last_status && <TimelineContent status={item.last_status} />
  }, [])

  return (
    <View style={styles.statusView}>
      <View style={styles.status}>
        <TimelineAvatar account={item.accounts[0]} />
        <View style={styles.details}>
          <TimelineHeaderConversation
            queryKey={queryKey}
            id={item.id}
            account={item.accounts[0]}
            created_at={item.last_status?.created_at}
          />
          <Pressable
            onPress={conversationOnPress}
            children={conversationChildren}
          />
        </View>
      </View>

      <View
        style={{
          paddingLeft: highlighted
            ? 0
            : StyleConstants.Avatar.S + StyleConstants.Spacing.S
        }}
      >
        <TimelineActions queryKey={queryKey} status={item.last_status!} />
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
