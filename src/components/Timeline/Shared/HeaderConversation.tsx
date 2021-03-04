import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import { ParseEmojis } from '@components/Parse'
import {
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useQueryClient } from 'react-query'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'

const Names: React.FC<{ accounts: Mastodon.Account[] }> = ({ accounts }) => {
  const { t } = useTranslation('componentTimeline')
  const { theme } = useTheme()

  return (
    <Text numberOfLines={1}>
      <Text style={[styles.namesLeading, { color: theme.secondary }]}>
        {t('shared.header.conversation.withAccounts')}
      </Text>
      {accounts.map((account, index) => (
        <Text key={account.id} numberOfLines={1}>
          {index !== 0 ? t('common:separator') : undefined}
          <ParseEmojis
            content={account.display_name || account.username}
            emojis={account.emojis}
            fontBold
          />
        </Text>
      ))}
    </Text>
  )
}

export interface Props {
  queryKey: QueryKeyTimeline
  conversation: Mastodon.Conversation
}

const HeaderConversation = React.memo(
  ({ queryKey, conversation }: Props) => {
    const { mode } = useTheme()
    const { t } = useTranslation('componentTimeline')

    const queryClient = useQueryClient()
    const mutation = useTimelineMutation({
      queryClient,
      onMutate: true,
      onError: (err: any, _, oldData) => {
        displayMessage({
          mode,
          type: 'error',
          message: t('common:toastMessage.error.message', {
            function: t(`shared.header.conversation.delete.function`)
          }),
          ...(err.status &&
            typeof err.status === 'number' &&
            err.data &&
            err.data.error &&
            typeof err.data.error === 'string' && {
              description: err.data.error
            })
        })
        queryClient.setQueryData(queryKey, oldData)
      }
    })

    const { theme } = useTheme()

    const actionOnPress = useCallback(() => {
      analytics('timeline_conversation_delete_press')
      mutation.mutate({
        type: 'deleteItem',
        source: 'conversations',
        queryKey,
        id: conversation.id
      })
    }, [])

    const actionChildren = useMemo(
      () => (
        <Icon
          name='Trash'
          color={theme.secondary}
          size={StyleConstants.Font.Size.L}
        />
      ),
      []
    )

    return (
      <View style={styles.base}>
        <View style={styles.nameAndMeta}>
          <Names accounts={conversation.accounts} />
          <View style={styles.meta}>
            {conversation.last_status?.created_at ? (
              <HeaderSharedCreated
                created_at={conversation.last_status?.created_at}
              />
            ) : null}
            <HeaderSharedMuted muted={conversation.last_status?.muted} />
          </View>
        </View>

        <Pressable
          style={styles.action}
          onPress={actionOnPress}
          children={actionChildren}
        />
      </View>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row'
  },
  nameAndMeta: {
    flex: 3
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
  },
  namesLeading: {
    ...StyleConstants.FontStyle.M
  }
})

export default HeaderConversation
