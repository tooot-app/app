import { displayMessage } from '@components/Message'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQueryClient } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { featureCheck } from '@utils/helpers/featureCheck'
import { RootStackParamList, useNavState } from '@utils/navigation/navigators'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { useAccountStorage } from '@utils/storage/actions'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

const menuStatus = ({
  status,
  queryKey
}: {
  status?: Mastodon.Status
  queryKey?: QueryKeyTimeline
}): ContextMenu => {
  if (!status || !queryKey) return []

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Screen-Tabs'>>()
  const { theme } = useTheme()
  const { t } = useTranslation(['common', 'componentContextMenu'])

  const navigationState = useNavState()

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onMutate: true,
    onError: (err: any, params, oldData) => {
      const theFunction = (params as MutationVarsTimelineUpdateStatusProperty).payload
        ? (params as MutationVarsTimelineUpdateStatusProperty).payload.type
        : 'delete'
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(`componentContextMenu:status.${theFunction}.action` as any)
        }),
        ...(err?.status &&
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

  const menus: ContextMenu = []

  const [accountId] = useAccountStorage.string('auth.account.id')
  const [accountAcct] = useAccountStorage.string('auth.account.acct')
  const ownAccount = accountId === status.account?.id

  const canEditPost = featureCheck('edit_post')

  menus.push([
    {
      type: 'item',
      key: 'status-edit',
      props: {
        onSelect: async () => {
          let replyToStatus: Mastodon.Status | undefined = undefined
          if (status.in_reply_to_id) {
            replyToStatus = await apiInstance<Mastodon.Status>({
              method: 'get',
              url: `statuses/${status.in_reply_to_id}`
            }).then(res => res.body)
          }
          apiInstance<{
            id: Mastodon.Status['id']
            text: NonNullable<Mastodon.Status['text']>
            spoiler_text: Mastodon.Status['spoiler_text']
          }>({
            method: 'get',
            url: `statuses/${status.id}/source`
          }).then(res => {
            navigation.navigate('Screen-Compose', {
              type: 'edit',
              incomingStatus: {
                ...status,
                text: res.body.text,
                spoiler_text: res.body.spoiler_text
              },
              ...(replyToStatus && { replyToStatus }),
              navigationState
            })
          })
        },
        disabled: false,
        destructive: false,
        hidden: !ownAccount || !canEditPost
      },
      title: t('componentContextMenu:status.edit.action'),
      icon: 'square.and.pencil'
    },
    {
      type: 'item',
      key: 'status-delete-edit',
      props: {
        onSelect: () =>
          Alert.alert(
            t('componentContextMenu:status.deleteEdit.alert.title'),
            t('componentContextMenu:status.deleteEdit.alert.message'),
            [
              {
                text: t('common:buttons.confirm'),
                style: 'destructive',
                onPress: async () => {
                  let replyToStatus: Mastodon.Status | undefined = undefined
                  if (status.in_reply_to_id) {
                    replyToStatus = await apiInstance<Mastodon.Status>({
                      method: 'get',
                      url: `statuses/${status.in_reply_to_id}`
                    }).then(res => res.body)
                  }
                  mutation
                    .mutateAsync({ type: 'deleteItem', source: 'statuses', id: status.id })
                    .then(res => {
                      navigation.navigate('Screen-Compose', {
                        type: 'deleteEdit',
                        incomingStatus: res.body as Mastodon.Status,
                        ...(replyToStatus && { replyToStatus }),
                        navigationState
                      })
                    })
                }
              },
              {
                text: t('common:buttons.cancel')
              }
            ]
          ),
        disabled: false,
        destructive: true,
        hidden: !ownAccount
      },
      title: t('componentContextMenu:status.deleteEdit.action'),
      icon: 'pencil.and.outline'
    },
    {
      type: 'item',
      key: 'status-delete',
      props: {
        onSelect: () =>
          Alert.alert(
            t('componentContextMenu:status.delete.alert.title'),
            t('componentContextMenu:status.delete.alert.message'),
            [
              {
                text: t('common:buttons.confirm'),
                style: 'destructive',
                onPress: async () => {
                  mutation.mutate({ type: 'deleteItem', source: 'statuses', id: status.id })
                }
              },
              {
                text: t('common:buttons.cancel'),
                style: 'default'
              }
            ]
          ),
        disabled: false,
        destructive: true,
        hidden: !ownAccount
      },
      title: t('componentContextMenu:status.delete.action'),
      icon: 'trash'
    }
  ])

  menus.push([
    {
      type: 'item',
      key: 'status-mute',
      props: {
        onSelect: () =>
          mutation.mutate({
            type: 'updateStatusProperty',
            status,
            payload: {
              type: 'muted',
              to: !status.muted
            }
          }),
        disabled: false,
        destructive: false,
        hidden:
          !ownAccount &&
          queryKey[1].page !== 'Notifications' &&
          !status.mentions.find(
            mention => mention.acct === accountAcct && mention.username === accountAcct
          ) &&
          !status.muted
      },
      title: t('componentContextMenu:status.mute.action', {
        defaultValue: 'false',
        context: (status.muted || false).toString()
      }),
      icon: status.muted ? 'speaker' : 'speaker.slash'
    },
    {
      type: 'item',
      key: 'status-pin',
      props: {
        onSelect: () =>
          // Also note that reblogs cannot be pinned.
          mutation.mutate({
            type: 'updateStatusProperty',
            status,
            payload: {
              type: 'pinned',
              to: !status.pinned
            }
          }),
        disabled: status.visibility !== 'public' && status.visibility !== 'unlisted',
        destructive: false,
        hidden: !ownAccount
      },
      title: t('componentContextMenu:status.pin.action', {
        defaultValue: 'false',
        context: (status.pinned || false).toString()
      }),
      icon: status.pinned ? 'pin.slash' : 'pin'
    }
  ])

  return menus
}

export default menuStatus
