import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import {
  QueryKeyRelationship,
  useRelationshipMutation,
  useRelationshipQuery
} from '@utils/queryHooks/relationship'
import {
  MutationVarsTimelineUpdateAccountProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'

const menuAccount = ({
  openChange,
  id,
  queryKey,
  rootQueryKey
}: {
  openChange: boolean
  id?: Mastodon.Account['id']
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}): ContextMenu[][] => {
  if (!id) return []

  const { theme } = useTheme()
  const { t } = useTranslation('componentContextMenu')

  const menus: ContextMenu[][] = [[]]

  const instanceAccount = useSelector(getInstanceAccount, (prev, next) => prev.id === next.id)
  const ownAccount = instanceAccount?.id === id

  const [enabled, setEnabled] = useState(openChange)
  useEffect(() => {
    if (!ownAccount && enabled === false && openChange === true) {
      setEnabled(true)
    }
  }, [openChange, enabled])
  const { data, isFetching } = useRelationshipQuery({ id, options: { enabled } })

  const queryClient = useQueryClient()
  const timelineMutation = useTimelineMutation({
    onSuccess: (_, params) => {
      queryClient.refetchQueries(['Relationship', { id }])
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
  const queryKeyRelationship: QueryKeyRelationship = ['Relationship', { id }]
  const relationshipMutation = useRelationshipMutation({
    onSuccess: (res, { payload: { action } }) => {
      haptics('Success')
      queryClient.setQueryData<Mastodon.Relationship[]>(queryKeyRelationship, [res])
      if (action === 'block') {
        const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Following' }]
        queryClient.invalidateQueries(queryKey)
      }
    },
    onError: (err: any, { payload: { action } }) => {
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(`${action}.function`)
        }),
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          })
      })
    }
  })

  if (!ownAccount && Platform.OS !== 'android') {
    menus[0].push({
      key: 'account-following',
      item: {
        onSelect: () =>
          data &&
          relationshipMutation.mutate({
            id,
            type: 'outgoing',
            payload: { action: 'follow', state: !data?.requested ? data.following : true }
          }),
        disabled: !data || isFetching,
        destructive: false,
        hidden: false
      },
      title: !data?.requested
        ? t('account.following.action', {
            context: (data?.following || false).toString()
          })
        : t('componentRelationship:button.requested'),
      icon: !data?.requested
        ? data?.following
          ? 'person.badge.minus'
          : 'person.badge.plus'
        : 'person.badge.minus'
    })
  }
  if (!ownAccount) {
    menus[0].push({
      key: 'account-mute',
      item: {
        onSelect: () =>
          timelineMutation.mutate({
            type: 'updateAccountProperty',
            queryKey,
            id,
            payload: { property: 'mute', currentValue: data?.muting }
          }),
        disabled: Platform.OS !== 'android' ? !data || isFetching : false,
        destructive: false,
        hidden: false
      },
      title: t('account.mute.action', {
        context: (data?.muting || false).toString()
      }),
      icon: data?.muting ? 'eye' : 'eye.slash'
    })
  }

  !ownAccount &&
    menus.push([
      {
        key: 'account-block',
        item: {
          onSelect: () =>
            timelineMutation.mutate({
              type: 'updateAccountProperty',
              queryKey,
              id,
              payload: { property: 'block', currentValue: data?.blocking }
            }),
          disabled: Platform.OS !== 'android' ? !data || isFetching : false,
          destructive: !data?.blocking,
          hidden: false
        },
        title: t('account.block.action', {
          context: (data?.blocking || false).toString()
        }),
        icon: data?.blocking ? 'checkmark.circle' : 'xmark.circle'
      },
      {
        key: 'account-reports',
        item: {
          onSelect: () => {
            timelineMutation.mutate({
              type: 'updateAccountProperty',
              queryKey,
              id,
              payload: { property: 'reports' }
            })
            timelineMutation.mutate({
              type: 'updateAccountProperty',
              queryKey,
              id,
              payload: { property: 'block', currentValue: false }
            })
          },
          disabled: false,
          destructive: true,
          hidden: false
        },
        title: t('account.reports.action'),
        icon: 'flag'
      }
    ])

  return menus
}

export default menuAccount
