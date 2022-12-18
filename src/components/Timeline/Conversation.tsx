import apiInstance from '@api/instance'
import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import TimelineActions from './Shared/Actions'
import TimelineContent from './Shared/Content'
import StatusContext from './Shared/Context'
import TimelineHeaderConversation from './Shared/HeaderConversation'
import TimelinePoll from './Shared/Poll'

export interface Props {
  conversation: Mastodon.Conversation
  queryKey: QueryKeyTimeline
  highlighted?: boolean
}

const TimelineConversation: React.FC<Props> = ({ conversation, queryKey, highlighted = false }) => {
  const { colors } = useTheme()

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

  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  const onPress = useCallback(() => {
    if (conversation.last_status) {
      conversation.unread && mutate()
      navigation.push('Tab-Shared-Toot', {
        toot: conversation.last_status,
        rootQueryKey: queryKey
      })
    }
  }, [])

  return (
    <StatusContext.Provider value={{ queryKey, status: conversation.last_status }}>
      <Pressable
        style={[
          {
            flex: 1,
            flexDirection: 'column',
            padding: StyleConstants.Spacing.Global.PagePadding,
            paddingBottom: 0,
            backgroundColor: colors.backgroundDefault
          },
          conversation.unread && {
            borderLeftWidth: StyleConstants.Spacing.XS,
            borderLeftColor: colors.blue,
            paddingLeft: StyleConstants.Spacing.Global.PagePadding - StyleConstants.Spacing.XS
          }
        ]}
        onPress={onPress}
      >
        <View style={{ flex: 1, width: '100%', flexDirection: 'row' }}>
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
            {conversation.accounts.slice(0, 4).map(account => (
              <GracefullyImage
                key={account.id}
                uri={{ original: account.avatar, static: account.avatar_static }}
                dimension={{
                  width: StyleConstants.Avatar.M,
                  height:
                    conversation.accounts.length > 2
                      ? StyleConstants.Avatar.M / 2
                      : StyleConstants.Avatar.M
                }}
                style={{ flex: 1, flexBasis: '50%' }}
              />
            ))}
          </View>
          <TimelineHeaderConversation conversation={conversation} />
        </View>

        {conversation.last_status ? (
          <View
            style={{
              paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
              paddingLeft: highlighted ? 0 : StyleConstants.Avatar.M + StyleConstants.Spacing.S
            }}
          >
            <TimelineContent />
            <TimelinePoll />

            <TimelineActions />
          </View>
        ) : null}
      </Pressable>
    </StatusContext.Provider>
  )
}

export default TimelineConversation
