import apiInstance from '@api/instance'
import { displayMessage } from '@components/Message'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@utils/navigation/navigators'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { featureCheck } from '@helpers/featureCheck'
import { useAccountStorage } from '@utils/storage/actions'

const menuStatus = ({
  status,
  queryKey,
  rootQueryKey
}: {
  status?: Mastodon.Status
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}): ContextMenu[][] => {
  if (!status || !queryKey) return []

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Screen-Tabs'>>()
  const { theme } = useTheme()
  const { t } = useTranslation(['common', 'componentContextMenu'])

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onMutate: true,
    onError: (err: any, params, oldData) => {
      const theFunction = (params as MutationVarsTimelineUpdateStatusProperty).payload
        ? (params as MutationVarsTimelineUpdateStatusProperty).payload.property
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

  const menus: ContextMenu[][] = []

  const [accountId] = useAccountStorage.string('auth.account.id')
  const ownAccount = accountId === status.account?.id

  const canEditPost = featureCheck('edit_post')

  menus.push([
    {
      key: 'status-edit',
      item: {
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
              queryKey,
              rootQueryKey
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
      key: 'status-delete-edit',
      item: {
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
                    .mutateAsync({
                      type: 'deleteItem',
                      source: 'statuses',
                      queryKey,
                      id: status.id
                    })
                    .then(res => {
                      navigation.navigate('Screen-Compose', {
                        type: 'deleteEdit',
                        incomingStatus: res.body as Mastodon.Status,
                        ...(replyToStatus && { replyToStatus }),
                        queryKey
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
      key: 'status-delete',
      item: {
        onSelect: () =>
          Alert.alert(
            t('componentContextMenu:status.delete.alert.title'),
            t('componentContextMenu:status.delete.alert.message'),
            [
              {
                text: t('common:buttons.confirm'),
                style: 'destructive',
                onPress: async () => {
                  mutation.mutate({
                    type: 'deleteItem',
                    source: 'statuses',
                    queryKey,
                    rootQueryKey,
                    id: status.id
                  })
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
      key: 'status-mute',
      item: {
        onSelect: () =>
          mutation.mutate({
            type: 'updateStatusProperty',
            queryKey,
            rootQueryKey,
            id: status.id,
            payload: {
              property: 'muted',
              currentValue: status.muted
            }
          }),
        disabled: false,
        destructive: false,
        hidden: !ownAccount && !status.mentions.filter(mention => mention.id === accountId).length
      },
      title: t('componentContextMenu:status.mute.action', {
        defaultValue: 'false',
        context: (status.muted || false).toString()
      }),
      icon: status.muted ? 'speaker' : 'speaker.slash'
    },
    {
      key: 'status-pin',
      item: {
        onSelect: () =>
          // Also note that reblogs cannot be pinned.
          mutation.mutate({
            type: 'updateStatusProperty',
            queryKey,
            rootQueryKey,
            id: status.id,
            payload: {
              property: 'pinned',
              currentValue: status.pinned,
              propertyCount: undefined,
              countValue: undefined
            }
          }),
        disabled: false,
        destructive: false,
        hidden: !ownAccount || (status.visibility !== 'public' && status.visibility !== 'unlisted')
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
