import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import { ParseEmojis } from '@components/Parse'
import CustomText from '@components/Text'
import {
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useQueryClient } from 'react-query'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'

const Names = ({ accounts }: { accounts: Mastodon.Account[] }) => {
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  return (
    <CustomText
      numberOfLines={1}
      style={{ ...StyleConstants.FontStyle.M, color: colors.secondary }}
    >
      <CustomText>{t('shared.header.conversation.withAccounts')}</CustomText>
      {accounts.map((account, index) => (
        <CustomText key={account.id} numberOfLines={1}>
          {index !== 0 ? t('common:separator') : undefined}
          <ParseEmojis
            content={account.display_name || account.username}
            emojis={account.emojis}
            fontBold
          />
        </CustomText>
      ))}
    </CustomText>
  )
}

export interface Props {
  queryKey: QueryKeyTimeline
  conversation: Mastodon.Conversation
}

const HeaderConversation = ({ queryKey, conversation }: Props) => {
  const { colors, theme } = useTheme()
  const { t } = useTranslation('componentTimeline')

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onMutate: true,
    onError: (err: any, _, oldData) => {
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
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
        color={colors.secondary}
        size={StyleConstants.Font.Size.L}
      />
    ),
    []
  )

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 3 }}>
        <Names accounts={conversation.accounts} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: StyleConstants.Spacing.XS,
            marginBottom: StyleConstants.Spacing.S
          }}
        >
          {conversation.last_status?.created_at ? (
            <HeaderSharedCreated
              created_at={conversation.last_status?.created_at}
              edited_at={conversation.last_status?.edited_at}
            />
          ) : null}
          <HeaderSharedMuted muted={conversation.last_status?.muted} />
        </View>
      </View>

      <Pressable
        style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}
        onPress={actionOnPress}
        children={actionChildren}
      />
    </View>
  )
}

export default HeaderConversation
