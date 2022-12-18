import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

const menuAccount = ({
  type,
  openChange,
  account,
  queryKey,
  rootQueryKey
}: {
  type: 'status' | 'account' // Where the action is coming from
  openChange: boolean
  account?: Pick<Mastodon.Account, 'id' | 'username'>
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}): ContextMenu[][] => {
  if (!account) return []

  const navigation =
    useNavigation<NativeStackNavigationProp<TabSharedStackParamList, any, undefined>>()
  const { t } = useTranslation('componentContextMenu')

  const menus: ContextMenu[][] = [[]]

  const instanceAccount = useSelector(getInstanceAccount)
  const ownAccount = instanceAccount?.id === account.id

  const [enabled, setEnabled] = useState(openChange)
  useEffect(() => {
    if (!ownAccount && enabled === false && openChange === true) {
      setEnabled(true)
    }
  }, [openChange, enabled])
  const { data, isFetched } = useRelationshipQuery({ id: account.id, options: { enabled } })

  const queryClient = useQueryClient()
  const timelineMutation = useTimelineMutation({
    onSuccess: (_, params) => {
      queryClient.refetchQueries(['Relationship', { id: account.id }])
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
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
        type: 'danger',
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
  const queryKeyRelationship: QueryKeyRelationship = ['Relationship', { id: account.id }]
  const relationshipMutation = useRelationshipMutation({
    onSuccess: (res, { payload: { action } }) => {
      haptics('Success')
      queryClient.setQueryData<Mastodon.Relationship[]>(queryKeyRelationship, [res])
      if (action === 'block') {
        const queryKey = ['Timeline', { page: 'Following' }]
        queryClient.invalidateQueries({ queryKey, exact: false })
      }
    },
    onError: (err: any, { payload: { action } }) => {
      displayMessage({
        type: 'danger',
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

  if (!ownAccount && Platform.OS !== 'android' && type !== 'account') {
    menus[0].push({
      key: 'account-following',
      item: {
        onSelect: () =>
          data &&
          relationshipMutation.mutate({
            id: account.id,
            type: 'outgoing',
            payload: { action: 'follow', state: !data?.requested ? data.following : true }
          }),
        disabled: !data || !isFetched,
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
      key: 'account-list',
      item: {
        onSelect: () => navigation.navigate('Tab-Shared-Account-In-Lists', { account }),
        disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
        destructive: false,
        hidden: !isFetched || !data?.following
      },
      title: t('account.inLists'),
      icon: 'checklist'
    })
    menus[0].push({
      key: 'account-mute',
      item: {
        onSelect: () =>
          timelineMutation.mutate({
            type: 'updateAccountProperty',
            queryKey,
            id: account.id,
            payload: { property: 'mute', currentValue: data?.muting }
          }),
        disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
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
              id: account.id,
              payload: { property: 'block', currentValue: data?.blocking }
            }),
          disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
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
              id: account.id,
              payload: { property: 'reports' }
            })
            timelineMutation.mutate({
              type: 'updateAccountProperty',
              queryKey,
              id: account.id,
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
