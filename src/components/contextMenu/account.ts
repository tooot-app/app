import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQueryClient } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { checkIsMyAccount } from '@utils/helpers/isMyAccount'
import { TabSharedStackParamList, useNavState } from '@utils/navigation/navigators'
import { useAccountQuery } from '@utils/queryHooks/account'
import {
  QueryKeyRelationship,
  useRelationshipMutation,
  useRelationshipQuery
} from '@utils/queryHooks/relationship'
import {
  MutationVarsTimelineUpdateAccountProperty,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { getAccountStorage, getReadableAccounts } from '@utils/storage/actions'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'

const menuAccount = ({
  type,
  openChange,
  account,
  status
}: {
  type: 'status' | 'account' // Where the action is coming from
  openChange: boolean
  account?: Partial<Mastodon.Account> & Pick<Mastodon.Account, 'id' | 'username' | 'acct' | 'url'>
  status?: Mastodon.Status
}): ContextMenu => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabSharedStackParamList, any, undefined>>()
  const navState = useNavState()
  const { t } = useTranslation(['common', 'componentContextMenu', 'componentRelationship'])

  const menus: ContextMenu = [[]]

  const [enabled, setEnabled] = useState(openChange)
  useEffect(() => {
    if (!isMyAccount && enabled === false && openChange === true) {
      setEnabled(true)
    }
  }, [openChange, enabled])
  const { data: fetchedAccount } = useAccountQuery({ account, _local: true, options: { enabled } })
  const actualAccount = status?._remote ? fetchedAccount : account
  const isMyAccount = checkIsMyAccount(actualAccount?.id)
  const { data, isFetched } = useRelationshipQuery({
    id: actualAccount?.id,
    options: { enabled: !!actualAccount?.id && enabled }
  })

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
      for (const key of navState) {
        queryClient.invalidateQueries(key)
      }
    }
  })
  const queryKeyRelationship: QueryKeyRelationship = ['Relationship', { id: actualAccount?.id }]
  const relationshipMutation = useRelationshipMutation({
    onSuccess: (res, vars) => {
      haptics('Success')
      queryClient.setQueryData<Mastodon.Relationship[]>(queryKeyRelationship, [res])
      if (vars.type === 'outgoing' && vars.payload.action === 'block') {
        queryClient.invalidateQueries({
          queryKey: ['Timeline', { page: 'Following' }],
          exact: false
        })
      }
    },
    onError: (err: any, vars) => {
      displayMessage({
        type: 'danger',
        message: t('common:message.error.message', {
          function: t(`componentContextMenu:${(vars.payload as any).action}.function` as any)
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

  if (!isMyAccount && Platform.OS !== 'android' && type !== 'account') {
    menus[0].push({
      type: 'item',
      key: 'account-following',
      props: {
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

  if (!isMyAccount) {
    menus[0].push({
      type: 'item',
      key: 'account-list',
      props: {
        onSelect: () => navigation.navigate('Tab-Shared-Account-In-Lists', { account }),
        disabled: Platform.OS !== 'android' ? !data || !isFetched : false,
        destructive: false,
        hidden: !isFetched || !data?.following
      },
      title: t('componentContextMenu:account.inLists'),
      icon: 'checklist'
    })
    menus[0].push({
      type: 'item',
      key: 'account-show-boosts',
      props: {
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
      type: 'item',
      key: 'account-mute',
      props: {
        onSelect: () =>
          actualAccount &&
          timelineMutation.mutate({
            type: 'updateAccountProperty',
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

    const followAs = () => {
      if (type !== 'account') return
      const accounts = getReadableAccounts()
      menus[0].push({
        type: 'sub',
        key: 'account-follow-as',
        trigger: {
          key: 'account-follow-as',
          props: { destructive: false, disabled: false, hidden: !accounts.length },
          title: t('componentContextMenu:account.followAs.trigger'),
          icon: 'person.badge.plus'
        },
        items: accounts.map(a => ({
          key: `account-${a.key}`,
          props: {
            onSelect: async () => {
              const lookup = await apiInstance<Mastodon.Account>({
                account: a.key,
                method: 'get',
                url: 'accounts/lookup',
                params: {
                  acct:
                    account.acct === account.username
                      ? `${account.acct}@${getAccountStorage.string('auth.account.domain')}`
                      : account.acct
                }
              }).then(res => res.body)
              await apiInstance({
                account: a.key,
                method: 'post',
                url: `accounts/${lookup.id}/follow`
              })
                .then(() =>
                  displayMessage({
                    type: 'success',
                    message: t('componentContextMenu:account.followAs.succeed', {
                      context: account.locked ? 'locked' : 'default',
                      defaultValue: 'default',
                      target: account.acct,
                      source: a.acct
                    })
                  })
                )
                .catch(err =>
                  displayMessage({
                    type: 'error',
                    message: t('common:message.error.message', {
                      function: t('componentContextMenu:account.followAs.failed')
                    }),
                    ...(err.status &&
                      typeof err.status === 'number' &&
                      err.data &&
                      err.data.error &&
                      typeof err.data.error === 'string' && {
                        description: err.data.error
                      })
                  })
                )
            },
            disabled: false,
            destructive: false,
            hidden: a.active
          },
          title: a.acct
        }))
      })
    }
    followAs()

    menus.push([
      {
        type: 'sub',
        key: 'account-block-report',
        trigger: {
          key: 'account-block-report',
          props: { destructive: true, disabled: false, hidden: false },
          title: t('componentContextMenu:account.blockReport'),
          icon: 'hand.raised'
        },
        items: [
          {
            key: 'account-block',
            props: {
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
            props: {
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
        ]
      }
    ])
  }

  return menus
}

export default menuAccount
