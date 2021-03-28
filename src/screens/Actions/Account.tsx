import analytics from '@components/analytics'
import { MenuContainer, MenuHeader, MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import {
  MutationVarsTimelineUpdateAccountProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'

export interface Props {
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  account: Mastodon.Account
  dismiss: () => void
}

const ActionsAccount: React.FC<Props> = ({
  queryKey,
  rootQueryKey,
  account,
  dismiss
}) => {
  const { mode } = useTheme()
  const { t } = useTranslation('componentTimeline')

  const queryClient = useQueryClient()
  const mutateion = useTimelineMutation({
    onSuccess: (_, params) => {
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        mode,
        type: 'success',
        message: t('common:message.success.message', {
          function: t(
            `shared.header.actions.account.${theParams.payload.property}.function`,
            {
              acct: account.acct
            }
          )
        })
      })
    },
    onError: (err: any, params) => {
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        mode,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(
            `shared.header.actions.account.${theParams.payload.property}.function`
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
      rootQueryKey && queryClient.invalidateQueries(rootQueryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading={t('shared.header.actions.account.heading')} />
      <MenuRow
        onPress={() => {
          analytics('timeline_shared_headeractions_account_mute_press', {
            page: queryKey && queryKey[1].page
          })
          dismiss()
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
          analytics('timeline_shared_headeractions_account_block_press', {
            page: queryKey && queryKey[1].page
          })
          dismiss()
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
          analytics('timeline_shared_headeractions_account_reports_press', {
            page: queryKey && queryKey[1].page
          })
          dismiss()
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

export default ActionsAccount
