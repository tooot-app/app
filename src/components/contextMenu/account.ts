import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQueryClient } from '@tanstack/react-query'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
import { useAccountQuery } from '@utils/queryHooks/account'
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
import { useAccountStorage } from '@utils/storage/actions'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'

const menuAccount = ({
  type,
  openChange,
  account,
  status,
  queryKey,
  rootQueryKey
}: {
  type: 'status' | 'account' // Where the action is coming from
  openChange: boolean
  account?: Partial<Mastodon.Account> & Pick<Mastodon.Account, 'id' | 'username' | 'acct' | 'url'>
  status?: Mastodon.Status
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}): ContextMenu[][] => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabSharedStackParamList, any, undefined>>()
  const { t } = useTranslation(['common', 'componentContextMenu', 'componentRelationship'])

  const menus: ContextMenu[][] = [[]]

  const [enabled, setEnabled] = useState(openChange)
  useEffect(() => {
    if (!ownAccount && enabled === false && openChange === true) {
      setEnabled(true)
    }
  }, [openChange, enabled])
  const { data: fetchedAccount } = useAccountQuery({ account, options: { enabled } })
  const actualAccount = status?._remote ? fetchedAccount : account
  const { data, isFetched } = useRelationshipQuery({
    id: actualAccount?.id,
    options: { enabled: !!actualAccount?.id && enabled }
  })

  const ownAccount = useAccountStorage.string('auth.account.id')['0'] === actualAccount?.id

  const queryClient = useQueryClient()
  const timelineMutation = useTimelineMutation({
    onSuccess: (_, params) => {
      queryClient.refetchQueries(['Relationship', { id: actualAccount?.id }])
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        type: 'success',
        message: t('common:message.success.message', {
          function: t(
            `componentContextMenu:account.${theParams.payload.property}.action`,
            theParams.payload.property !== 'reports'
              ? {
                  defaultValue: 'false',
                  context: (theParams.payload.currentValue || false).toString()
                }
              : { defaultValue: 'false' }
          )
        })
      })
    },
    onError: (err: any, params) => {
      const theParams = params as MutationVarsTimelineUpdateAccountProperty
      displayMessage({
        type: 'danger',
        message: t('common:message.error.message', {
          function: t(
            `componentContextMenu:account.${theParams.payload.property}.action`,
            theParams.payload.property !== 'reports'
              ? {
                  defaultValue: 'false',
                  context: (theParams.payload.currentValue || false).toString()
                }
              : { defaultValue: 'false' }
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
  const queryKeyRelationship: QueryKeyRelationship = ['Relationship', { id: actualAccount?.id }]
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
          function: t(`componentContextMenu:${action}.function` as any)
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

  if (!account) return []

  if (!ownAccount && Platform.OS !== 'android' && type !== 'account') {
    menus[0].push({
      key: 'account-following',
      item: {
        onSelect: () =>
          data &&
          actualAccount &&
          relationshipMutation.mutate({
            id: actualAccount.id,
            type: 'outgoing',
            payload: { action: 'follow', state: !data?.requested ? data.following : true }
          }),
        disabled: !data || !isFetched,
        destructive: false,
        hidden: false
      },
      title: !data?.requested
        ? t('componentContextMenu:account.following.action', {
            defaultValue: 'false',
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
      title: t('componentContextMenu:account.inLists'),
      icon: 'checklist'
    })
    menus[0].push({
      key: 'account-show-boosts',
      item: {
        onSelect: () =>
          actualAccount &&
          relationshipMutation.mutate({
            id: actualAccount.id,
            type: 'outgoing',
            payload: { action: 'follow', state: false, reblogs: !data?.showing_reblogs }
          }),
        disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
        destructive: false,
        hidden: !isFetched || !data?.following
      },
      title: t('componentContextMenu:account.showBoosts.action', {
        defaultValue: 'false',
        context: (data?.showing_reblogs || false).toString()
      }),
      icon: data?.showing_reblogs ? 'rectangle.on.rectangle.slash' : 'rectangle.on.rectangle'
    })
    menus[0].push({
      key: 'account-mute',
      item: {
        onSelect: () =>
          actualAccount &&
          timelineMutation.mutate({
            type: 'updateAccountProperty',
            queryKey,
            id: actualAccount.id,
            payload: { property: 'mute', currentValue: data?.muting }
          }),
        disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
        destructive: false,
        hidden: false
      },
      title: t('componentContextMenu:account.mute.action', {
        defaultValue: 'false',
        context: (data?.muting || false).toString()
      }),
      icon: data?.muting ? 'eye' : 'eye.slash'
    })

    menus.push([
      {
        key: 'account-block',
        item: {
          onSelect: () =>
            Alert.alert(
              t('componentContextMenu:account.block.alert.title', {
                username: actualAccount?.username
              }),
              undefined,
              [
                {
                  text: t('common:buttons.confirm'),
                  style: 'destructive',
                  onPress: () =>
                    actualAccount &&
                    timelineMutation.mutate({
                      type: 'updateAccountProperty',
                      queryKey,
                      id: actualAccount.id,
                      payload: { property: 'block', currentValue: data?.blocking }
                    })
                },
                {
                  text: t('common:buttons.cancel')
                }
              ]
            ),
          disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
          destructive: !data?.blocking,
          hidden: false
        },
        title: t('componentContextMenu:account.block.action', {
          defaultValue: 'false',
          context: (data?.blocking || false).toString()
        }),
        icon: data?.blocking ? 'checkmark.circle' : 'xmark.circle'
      },
      {
        key: 'account-reports',
        item: {
          onSelect: () =>
            actualAccount &&
            navigation.navigate('Tab-Shared-Report', {
              account: actualAccount,
              status
            }),
          disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
          destructive: true,
          hidden: false
        },
        title: t('componentContextMenu:account.reports.action'),
        icon: 'flag'
      }
    ])
  }

  return menus
}

export default menuAccount
