import React, { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import TimelineAvatar from '@components/Timelines/Timeline/Shared/Avatar'
import TimelineHeaderConversation from '@components/Timelines/Timeline/Shared/HeaderConversation'
import TimelineContent from '@components/Timelines/Timeline/Shared/Content'
import { StyleConstants } from '@utils/styles/constants'
import TimelineActions from '@components/Timelines/Timeline/Shared/Actions'
import client from '@root/api/client'
import { useMutation, useQueryClient } from 'react-query'

export interface Props {
  conversation: Mastodon.Conversation
  queryKey: QueryKey.Timeline
  highlighted?: boolean
}

const fireMutation = async ({ id }: { id: Mastodon.Conversation['id'] }) => {
  const res = await client({
    method: 'post',
    instance: 'local',
    url: `conversations/${id}/read`
  })

  if (res.body.id === id) {
    return Promise.resolve()
  } else {
    return Promise.reject()
  }
}

const TimelineConversation: React.FC<Props> = ({
  conversation,
  queryKey,
  highlighted = false
}) => {
  const queryClient = useQueryClient()
  const { mutate } = useMutation(fireMutation, {
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
    }
  })

  const navigation = useNavigation()

  const onPress = useCallback(() => {
    if (conversation.last_status) {
      conversation.unread && mutate({ id: conversation.id })
      navigation.push('Screen-Shared-Toot', {
        toot: conversation.last_status
      })
    }
  }, [])

  return (
    <Pressable style={styles.conversationView} onPress={onPress}>
      <View style={styles.header}>
        <TimelineAvatar
          queryKey={queryKey}
          account={conversation.accounts[0]}
        />
        <TimelineHeaderConversation
          queryKey={queryKey}
          conversation={conversation}
        />
      </View>

      {conversation.last_status ? (
        <View
          style={{
            paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
            paddingLeft: highlighted
              ? 0
              : StyleConstants.Avatar.M + StyleConstants.Spacing.S
          }}
        >
          <TimelineContent
            status={conversation.last_status}
            highlighted={highlighted}
          />
        </View>
      ) : null}

      <View
        style={{
          paddingLeft: highlighted
            ? 0
            : StyleConstants.Avatar.M + StyleConstants.Spacing.S
        }}
      >
        <TimelineActions
          queryKey={queryKey}
          status={conversation.last_status!}
          reblog={false}
        />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  conversationView: {
    flex: 1,
    flexDirection: 'column',
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  header: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
  }
})

export default TimelineConversation
