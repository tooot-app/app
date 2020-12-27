import { Feather } from '@expo/vector-icons'
import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'
import client from '@api/client'
import { toast } from '@components/toast'

import relativeTime from '@utils/relativeTime'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import Emojis from '@components/Timelines/Timeline/Shared/Emojis'

export interface Props {
  queryKey: QueryKey.Timeline
  conversation: Mastodon.Conversation
}

const fireMutation = async ({ id }: { id: string }) => {
  const res = await client({
    method: 'delete',
    instance: 'local',
    url: `conversations/${id}`
  })

  if (!res.body.error) {
    toast({ type: 'success', content: '删除私信成功' })
    return Promise.resolve()
  } else {
    toast({
      type: 'error',
      content: '删除私信失败，请重试',
      autoHide: false
    })
    return Promise.reject()
  }
}

const HeaderConversation: React.FC<Props> = ({ queryKey, conversation }) => {
  const queryClient = useQueryClient()
  const { mutate } = useMutation(fireMutation, {
    onMutate: () => {
      queryClient.cancelQueries(queryKey)
      const oldData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any) =>
        old.pages.map((paging: any) => ({
          toots: paging.toots.filter(
            (toot: Mastodon.Conversation) => toot.id !== conversation.id
          ),
          pointer: paging.pointer
        }))
      )

      return oldData
    },
    onError: (err, _, oldData) => {
      toast({ type: 'error', content: '请重试', autoHide: false })
      queryClient.setQueryData(queryKey, oldData)
    }
  })

  const { theme } = useTheme()

  const actionOnPress = useCallback(() => mutate({ id: conversation.id }), [])

  const actionChildren = useMemo(
    () => (
      <Feather
        name='trash'
        color={theme.secondary}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    []
  )

  return (
    <View style={styles.base}>
      <View style={styles.nameAndDate}>
        <View style={styles.name}>
          {conversation.accounts[0].emojis ? (
            <Emojis
              content={
                conversation.accounts[0].display_name ||
                conversation.accounts[0].username
              }
              emojis={conversation.accounts[0].emojis}
              size={StyleConstants.Font.Size.M}
              fontBold={true}
            />
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.nameWithoutEmoji, { color: theme.primary }]}
            >
              {conversation.accounts[0].display_name ||
                conversation.accounts[0].username}
            </Text>
          )}
          <Text
            style={[styles.account, { color: theme.secondary }]}
            numberOfLines={1}
          >
            @{conversation.accounts[0].acct}
          </Text>
        </View>
        <View style={styles.meta}>
          {conversation.last_status?.created_at && (
            <Text style={[styles.created_at, { color: theme.secondary }]}>
              {relativeTime(conversation.last_status?.created_at)}
            </Text>
          )}
          {conversation.unread && (
            <Feather name='circle' color={theme.blue} style={styles.unread} />
          )}
        </View>
      </View>

      <Pressable
        style={styles.action}
        onPress={actionOnPress}
        children={actionChildren}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row'
  },
  nameAndDate: {
    width: '80%'
  },
  name: {
    flexDirection: 'row'
  },
  account: {
    flexShrink: 1,
    marginLeft: StyleConstants.Spacing.XS
  },
  nameWithoutEmoji: {
    fontSize: StyleConstants.Font.Size.M,
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  created_at: {
    fontSize: StyleConstants.Font.Size.S
  },
  unread: {
    marginLeft: StyleConstants.Spacing.XS
  },
  action: {
    flexBasis: '20%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default HeaderConversation
