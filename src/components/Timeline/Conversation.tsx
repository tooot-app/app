import apiInstance from '@api/instance'
import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'
import TimelineActions from './Shared/Actions'
import TimelineContent from './Shared/Content'
import TimelineHeaderConversation from './Shared/HeaderConversation'
import TimelinePoll from './Shared/Poll'

const Avatars: React.FC<{ accounts: Mastodon.Account[] }> = ({ accounts }) => {
  return (
    <View
      style={{
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: StyleConstants.Spacing.S,
        width: StyleConstants.Avatar.M,
        height: StyleConstants.Avatar.M,
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}
    >
      {accounts.slice(0, 4).map(account => (
        <GracefullyImage
          key={account.id}
          uri={{ original: account.avatar_static }}
          dimension={{
            width: StyleConstants.Avatar.M,
            height:
              accounts.length > 2
                ? StyleConstants.Avatar.M / 2
                : StyleConstants.Avatar.M
          }}
          style={{ flex: 1, flexBasis: '50%' }}
        />
      ))}
    </View>
  )
}

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
  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev?.id === next?.id
  )
  const { theme } = useTheme()

  const queryClient = useQueryClient()
  const fireMutation = useCallback(() => {
    return apiInstance<Mastodon.Conversation>({
      method: 'post',
      url: `conversations/${conversation.id}/read`
    })
  }, [])
  const { mutate } = useMutation(fireMutation, {
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
    }
  })

  const navigation = useNavigation<
    StackNavigationProp<Nav.TabLocalStackParamList>
  >()
  const onPress = useCallback(() => {
    analytics('timeline_conversation_press')
    if (conversation.last_status) {
      conversation.unread && mutate()
      navigation.push('Tab-Shared-Toot', {
        toot: conversation.last_status,
        rootQueryKey: queryKey
      })
    }
  }, [])

  return (
    <Pressable
      style={[
        styles.base,
        { backgroundColor: theme.backgroundDefault },
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
        <Avatars accounts={conversation.accounts} />
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
            {conversation.last_status.poll ? (
              <TimelinePoll
                queryKey={queryKey}
                statusId={conversation.last_status.id}
                poll={conversation.last_status.poll}
                reblog={false}
                sameAccount={
                  conversation.last_status.id === instanceAccount?.id
                }
              />
            ) : null}
          </View>
          <TimelineActions
            queryKey={queryKey}
            status={conversation.last_status}
            highlighted={highlighted}
            accts={conversation.accounts.map(account => account.acct)}
            reblog={false}
          />
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
