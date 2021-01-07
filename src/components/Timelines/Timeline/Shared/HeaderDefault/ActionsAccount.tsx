import client from '@api/client'
import haptics from '@components/haptics'
import { MenuContainer, MenuHeader, MenuRow } from '@components/Menu'
import { toast } from '@components/toast'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'

export interface Props {
  queryKey?: QueryKeyTimeline
  account: Pick<Mastodon.Account, 'id' | 'acct'>
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderDefaultActionsAccount: React.FC<Props> = ({
  queryKey,
  account,
  setBottomSheetVisible
}) => {
  const { t } = useTranslation()
  
  const queryClient = useQueryClient()
  const fireMutation = useCallback(
    async ({ type }: { type: 'mute' | 'block' | 'reports' }) => {
      switch (type) {
        case 'mute':
        case 'block':
          return client<Mastodon.Account>({
            method: 'post',
            instance: 'local',
            url: `accounts/${account.id}/${type}`
          })
          break
        case 'reports':
          return client<Mastodon.Account>({
            method: 'post',
            instance: 'local',
            url: `reports`,
            params: {
              account_id: account.id!
            }
          })
          break
      }
    },
    []
  )
  const { mutate } = useMutation(fireMutation, {
    onSuccess: (_, { type }) => {
      haptics('Success')
      toast({
        type: 'success',
        message: t('common:toastMessage.success.message', {
          function: t(
            `timeline:shared.header.default.actions.account.${type}.function`,
            { acct: account.acct }
          )
        })
      })
    },
    onError: (err: any, { type }) => {
      haptics('Error')
      toast({
        type: 'error',
        message: t('common:toastMessage.error.message', {
          function: t(
            `timeline:shared.header.default.actions.account.${type}.function`,
            { acct: account.acct }
          )
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
      <MenuHeader
        heading={t('timeline:shared.header.default.actions.account.heading')}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate({ type: 'mute' })
        }}
        iconFront='EyeOff'
        title={t('timeline:shared.header.default.actions.account.mute.button', {
          acct: account.acct
        })}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate({ type: 'block' })
        }}
        iconFront='XCircle'
        title={t(
          'timeline:shared.header.default.actions.account.block.button',
          {
            acct: account.acct
          }
        )}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate({ type: 'reports' })
        }}
        iconFront='Flag'
        title={t(
          'timeline:shared.header.default.actions.account.report.button',
          {
            acct: account.acct
          }
        )}
      />
    </MenuContainer>
  )
}

export default HeaderDefaultActionsAccount
