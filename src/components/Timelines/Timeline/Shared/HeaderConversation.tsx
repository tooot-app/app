import client from '@api/client'
import haptics from '@components/haptics'
import { toast } from '@components/toast'
import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedCreated from './HeaderShared/Created'

export interface Props {
  queryKey: QueryKey.Timeline
  conversation: Mastodon.Conversation
}

const HeaderConversation: React.FC<Props> = ({ queryKey, conversation }) => {
  const queryClient = useQueryClient()
  const fireMutation = useCallback(async () => {
    const res = await client({
      method: 'delete',
      instance: 'local',
      url: `conversations/${conversation.id}`
    })

    if (!res.body.error) {
      toast({ type: 'success', message: '删除私信成功' })
      return Promise.resolve()
    } else {
      toast({
        type: 'error',
        message: '删除私信失败，请重试',
        autoHide: false
      })
      return Promise.reject()
    }
  }, [])
  const { mutate } = useMutation(fireMutation, {
    onMutate: () => {
      queryClient.cancelQueries(queryKey)
      const oldData = queryClient.getQueryData(queryKey)

      haptics('Success')
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
      haptics('Error')
      toast({ type: 'error', message: '请重试', autoHide: false })
      queryClient.setQueryData(queryKey, oldData)
    }
  })

  const { theme } = useTheme()

  const actionOnPress = useCallback(() => mutate(), [])

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
      <View style={styles.nameAndMeta}>
        <HeaderSharedAccount account={conversation.accounts[0]} />
        <View style={styles.meta}>
          {conversation.last_status?.created_at ? (
            <HeaderSharedCreated
              created_at={conversation.last_status?.created_at}
            />
          ) : null}
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
  nameAndMeta: {
    flex: 4
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  created_at: {
    ...StyleConstants.FontStyle.S
  },
  unread: {
    marginLeft: StyleConstants.Spacing.XS
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default HeaderConversation
