import client from '@api/client'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { toast } from '@components/toast'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedCreated from './HeaderShared/Created'

export interface Props {
  queryKey: QueryKey.Timeline
  conversation: Mastodon.Conversation
}

const HeaderConversation: React.FC<Props> = ({ queryKey, conversation }) => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const fireMutation = useCallback(() => {
    return client({
      method: 'delete',
      instance: 'local',
      url: `conversations/${conversation.id}`
    })
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
    onError: (err: any, _, oldData) => {
      haptics('Error')
      toast({
        type: 'error',
        message: t('common:toastMessage.error.message', {
          function: t(`timeline:shared.header.conversation.delete.function`)
        }),
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          }),
        autoHide: false
      })
      queryClient.setQueryData(queryKey, oldData)
    }
  })

  const { theme } = useTheme()

  const actionOnPress = useCallback(() => mutate(), [])

  const actionChildren = useMemo(
    () => (
      <Icon
        name='Trash'
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
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default HeaderConversation
