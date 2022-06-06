import analytics from '@components/analytics'
import { displayMessage } from '@components/Message'
import {
  MutationVarsTimelineUpdateAccountProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { ContextMenuAction } from 'react-native-context-menu-view'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'

export interface Props {
  menuItems: ContextMenuAction[]
  status: Mastodon.Status
  queryKey: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}

const contextMenuAccount = ({
  menuItems,
  status,
  queryKey,
  rootQueryKey
}: Props) => {
  const { theme } = useTheme()
  const { t } = useTranslation('componentContextMenu')

  const queryClient = useQueryClient()
  const mutateion = useTimelineMutation({
    onSuccess: (_, params) => {
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        theme,
        type: 'success',
        message: t('common:message.success.message', {
          function: t(`account.${theParams.payload.property}.action`)
        })
      })
    },
    onError: (err: any, params) => {
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(`account.${theParams.payload.property}.action`)
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
  const ownAccount = instanceAccount?.id === status.account.id

  if (!ownAccount) {
    switch (Platform.OS) {
      case 'ios':
        menuItems.push({
          id: 'account',
          title: t('account.title'),
          inlineChildren: true,
          actions: [
            {
              id: 'account-mute',
              title: t('account.mute.action'),
              systemIcon: 'eye.slash'
            },
            {
              id: 'account-block',
              title: t('account.block.action'),
              systemIcon: 'xmark.circle',
              destructive: true
            },
            {
              id: 'account-reports',
              title: t('account.reports.action'),
              systemIcon: 'flag',
              destructive: true
            }
          ]
        })
        break
      default:
        menuItems.push(
          {
            id: 'account-mute',
            title: t('account.mute.action'),
            systemIcon: 'eye.slash'
          },
          {
            id: 'account-block',
            title: t('account.block.action'),
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
        break
    }
  }

  return (id: string) => {
    const url = status.url || status.uri
    switch (id) {
      case 'account-mute':
        analytics('timeline_shared_headeractions_account_mute_press', {
          page: queryKey && queryKey[1].page
        })
        mutateion.mutate({
          type: 'updateAccountProperty',
          queryKey,
          id: status.account.id,
          payload: { property: 'mute' }
        })
        break
      case 'account-block':
        analytics('timeline_shared_headeractions_account_block_press', {
          page: queryKey && queryKey[1].page
        })
        mutateion.mutate({
          type: 'updateAccountProperty',
          queryKey,
          id: status.account.id,
          payload: { property: 'block' }
        })
        break
      case 'account-report':
        analytics('timeline_shared_headeractions_account_reports_press', {
          page: queryKey && queryKey[1].page
        })
        mutateion.mutate({
          type: 'updateAccountProperty',
          queryKey,
          id: status.account.id,
          payload: { property: 'reports' }
        })
        break
    }
  }
}

export default contextMenuAccount
