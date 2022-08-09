import analytics from '@components/analytics'
import { displayMessage } from '@components/Message'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import {
  MutationVarsTimelineUpdateAccountProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { ContextMenuAction } from 'react-native-context-menu-view'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'

export interface Props {
  actions: ContextMenuAction[]
  type: 'status' | 'account' // Do not need to fetch relationship in timeline
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  id: Mastodon.Account['id']
}

const contextMenuAccount = ({
  actions,
  type,
  queryKey,
  rootQueryKey,
  id: accountId
}: Props) => {
  const { theme } = useTheme()
  const { t } = useTranslation('componentContextMenu')

  const queryClient = useQueryClient()
  const mutateion = useTimelineMutation({
    onSuccess: (_, params) => {
      queryClient.refetchQueries(['Relationship', { id: accountId }])
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        theme,
        type: 'success',
        message: t('common:message.success.message', {
          function: t(`account.${theParams.payload.property}.action`, {
            ...(theParams.payload.property !== 'reports' && {
              context: (theParams.payload.currentValue || false).toString()
            })
          })
        })
      })
    },
    onError: (err: any, params) => {
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(`account.${theParams.payload.property}.action`, {
            ...(theParams.payload.property !== 'reports' && {
              context: (theParams.payload.currentValue || false).toString()
            })
          })
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

  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev.id === next.id
  )
  const ownAccount = instanceAccount?.id === accountId

  const { data: relationship } = useRelationshipQuery({
    id: accountId,
    options: { enabled: type === 'account' }
  })

  if (!ownAccount) {
    actions.push(
      {
        id: 'account-mute',
        title: t('account.mute.action', {
          context: (relationship?.muting || false).toString()
        }),
        systemIcon: 'eye.slash'
      },
      {
        id: 'account-block',
        title: t('account.block.action', {
          context: (relationship?.blocking || false).toString()
        }),
        systemIcon: 'xmark.circle',
        destructive: true
      },
      {
        id: 'account-reports',
        title: t('account.reports.action'),
        systemIcon: 'flag',
        destructive: true
      }
    )
  }

  return (index: number) => {
    if (actions[index].id === 'account-mute') {
      analytics('timeline_shared_headeractions_account_mute_press', {
        page: queryKey && queryKey[1].page
      })
      mutateion.mutate({
        type: 'updateAccountProperty',
        queryKey,
        id: accountId,
        payload: { property: 'mute', currentValue: relationship?.muting }
      })
    }
    if (actions[index].id === 'account-block') {
      analytics('timeline_shared_headeractions_account_block_press', {
        page: queryKey && queryKey[1].page
      })
      mutateion.mutate({
        type: 'updateAccountProperty',
        queryKey,
        id: accountId,
        payload: { property: 'block', currentValue: relationship?.blocking }
      })
    }
    if (actions[index].id === 'account-report') {
      analytics('timeline_shared_headeractions_account_reports_press', {
        page: queryKey && queryKey[1].page
      })
      mutateion.mutate({
        type: 'updateAccountProperty',
        queryKey,
        id: accountId,
        payload: { property: 'reports' }
      })
    }
  }
}

export default contextMenuAccount
