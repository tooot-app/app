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
  id: string
  account: Mastodon.Account
  created_at?: Mastodon.Status['created_at']
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

const HeaderConversation: React.FC<Props> = ({
  queryKey,
  id,
  account,
  created_at
}) => {
  const queryClient = useQueryClient()
  const { mutate } = useMutation(fireMutation, {
    onMutate: () => {
      queryClient.cancelQueries(queryKey)
      const oldData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: any) =>
        old.pages.map((paging: any) => ({
          toots: paging.toots.filter((toot: any) => toot.id !== id),
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

  const actionOnPress = useCallback(() => mutate({ id }), [])

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
          {account.emojis ? (
            <Emojis
              content={account.display_name || account.username}
              emojis={account.emojis}
              size={StyleConstants.Font.Size.M}
              fontBold={true}
            />
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.nameWithoutEmoji, { color: theme.primary }]}
            >
              {account.display_name || account.username}
            </Text>
          )}
          <Text
            style={[styles.account, { color: theme.secondary }]}
            numberOfLines={1}
          >
            @{account.acct}
          </Text>
        </View>

        {created_at && (
          <View style={styles.meta}>
            <Text style={[styles.created_at, { color: theme.secondary }]}>
              {relativeTime(created_at)}
            </Text>
          </View>
        )}
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
  action: {
    flexBasis: '20%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default HeaderConversation
