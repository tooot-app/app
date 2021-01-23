import client from '@api/client'
import { useNavigation } from '@react-navigation/native'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getLocalAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'
import TimelineActions from './Shared/Actions'
import TimelineAvatar from './Shared/Avatar'
import TimelineContent from './Shared/Content'
import TimelineHeaderConversation from './Shared/HeaderConversation'
import TimelinePoll from './Shared/Poll'

export interface Props {
  conversation: Mastodon.Conversation
  queryKey: QueryKeyTimeline
  highlighted?: boolean
}

const TimelineConversation: React.FC<Props> = ({
  conversation,
  queryKey,
  highlighted = false
}) => {
  const localAccount = useSelector(getLocalAccount)
  const { theme } = useTheme()

  const queryClient = useQueryClient()
  const fireMutation = useCallback(() => {
    return client<Mastodon.Conversation>({
      method: 'post',
      instance: 'local',
      url: `conversations/${conversation.id}/read`
    })
  }, [])
  const { mutate } = useMutation(fireMutation, {
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
    }
  })

  const navigation = useNavigation()

  const onPress = useCallback(() => {
    if (conversation.last_status) {
      conversation.unread && mutate()
      navigation.push('Screen-Shared-Toot', {
        toot: conversation.last_status
      })
    }
  }, [])

  return (
    <Pressable
      style={[
        styles.base,
        conversation.unread && {
          borderLeftWidth: StyleConstants.Spacing.XS,
          borderLeftColor: theme.blue,
          paddingLeft:
            StyleConstants.Spacing.Global.PagePadding -
            StyleConstants.Spacing.XS
        }
      ]}
      onPress={onPress}
    >
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
        <>
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
            {conversation.last_status.poll && (
              <TimelinePoll
                queryKey={queryKey}
                statusId={conversation.last_status.id}
                poll={conversation.last_status.poll}
                reblog={false}
                sameAccount={conversation.last_status.id === localAccount?.id}
              />
            )}
          </View>
          <View
            style={{
              paddingLeft: highlighted
                ? 0
                : StyleConstants.Avatar.M + StyleConstants.Spacing.S
            }}
          >
            <TimelineActions
              queryKey={queryKey}
              status={conversation.last_status}
              reblog={false}
            />
          </View>
        </>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'column',
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: 0
  },
  header: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
  }
})

export default TimelineConversation
