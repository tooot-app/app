import haptics from '@components/haptics'
import { MenuContainer, MenuHeader, MenuRow } from '@components/Menu'
import { toast } from '@components/toast'
import {
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'

export interface Props {
  queryKey?: QueryKeyTimeline
  account: Pick<Mastodon.Account, 'id' | 'acct'>
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderActionsAccount: React.FC<Props> = ({
  queryKey,
  account,
  setBottomSheetVisible
}) => {
  const { t } = useTranslation('componentTimeline')

  const queryClient = useQueryClient()
  const mutateion = useTimelineMutation({
    queryClient,
    onSuccess: (_, { payload: { property } }) => {
      haptics('Success')
      toast({
        type: 'success',
        message: t('common:toastMessage.success.message', {
          function: t(`shared.header.actions.account.${property}.function`, {
            acct: account.acct
          })
        })
      })
    },
    onError: (err: any, { payload: { property } }) => {
      haptics('Error')
      toast({
        type: 'error',
        message: t('common:toastMessage.error.message', {
          function: t(`shared.header.actions.account.${property}.function`)
        }),
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          })
      })
    },
    onSettled: () => {
      queryKey && queryClient.invalidateQueries(queryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading={t('shared.header.actions.account.heading')} />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateion.mutate({
            type: 'updateAccountProperty',
            queryKey,
            id: account.id,
            payload: { property: 'mute' }
          })
        }}
        iconFront='EyeOff'
        title={t('shared.header.actions.account.mute.button', {
          acct: account.acct
        })}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateion.mutate({
            type: 'updateAccountProperty',
            queryKey,
            id: account.id,
            payload: { property: 'block' }
          })
        }}
        iconFront='XCircle'
        title={t('shared.header.actions.account.block.button', {
          acct: account.acct
        })}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateion.mutate({
            type: 'updateAccountProperty',
            queryKey,
            id: account.id,
            payload: { property: 'reports' }
          })
        }}
        iconFront='Flag'
        title={t('shared.header.actions.account.reports.button', {
          acct: account.acct
        })}
      />
    </MenuContainer>
  )
}

export default HeaderActionsAccount
