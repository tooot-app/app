import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import { ParseEmojis } from '@components/Parse'
import CustomText from '@components/Text'
import { useQueryClient } from '@tanstack/react-query'
import { useTimelineMutation } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import StatusContext from './Context'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'

export interface Props {
  conversation: Mastodon.Conversation
}

const HeaderConversation = ({ conversation }: Props) => {
  const { queryKey } = useContext(StatusContext)
  if (!queryKey) return null

  const { colors, theme } = useTheme()
  const { t } = useTranslation(['common', 'componentTimeline'])

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onMutate: true,
    onError: (err: any, _, oldData) => {
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(`componentTimeline:shared.header.conversation.delete.function`)
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

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 3 }}>
        <CustomText
          numberOfLines={1}
          style={{ ...StyleConstants.FontStyle.M, color: colors.secondary }}
        >
          <CustomText>{t('componentTimeline:shared.header.conversation.withAccounts')}</CustomText>
          {conversation.accounts.map((account, index) => (
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: StyleConstants.Spacing.XS,
            marginBottom: StyleConstants.Spacing.S
          }}
        >
          {conversation.last_status?.created_at ? <HeaderSharedCreated /> : null}
          <HeaderSharedMuted />
        </View>
      </View>

      <Pressable
        style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}
        onPress={() =>
          mutation.mutate({
            type: 'deleteItem',
            source: 'conversations',
            id: conversation.id
          })
        }
        children={<Icon name='Trash' color={colors.secondary} size={StyleConstants.Font.Size.L} />}
      />
    </View>
  )
}

export default HeaderConversation
