import apiInstance from '@api/instance'
import analytics from '@components/analytics'
import { displayMessage } from '@components/Message'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@utils/navigation/navigators'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import {
  checkInstanceFeature,
  getInstanceAccount
} from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { ContextMenuAction } from 'react-native-context-menu-view'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'

export interface Props {
  actions: ContextMenuAction[]
  status: Mastodon.Status
  queryKey: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}

const contextMenuStatus = ({
  actions,
  status,
  queryKey,
  rootQueryKey
}: Props) => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'Screen-Tabs'>
    >()
  const { theme } = useTheme()
  const { t } = useTranslation('componentContextMenu')

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onMutate: true,
    onError: (err: any, params, oldData) => {
      const theFunction = (params as MutationVarsTimelineUpdateStatusProperty)
        .payload
        ? (params as MutationVarsTimelineUpdateStatusProperty).payload.property
        : 'delete'
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(`status.${theFunction}.action`)
        }),
        ...(err.status &&
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

  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev.id === next.id
  )
  const ownAccount = instanceAccount?.id === status?.account.id

  if (ownAccount) {
    const accountMenuItems: ContextMenuAction[] = [
      {
        id: 'status-delete',
        title: t('status.delete.action'),
        systemIcon: 'trash',
        destructive: true
      },
      {
        id: 'status-delete-edit',
        title: t('status.deleteEdit.action'),
        systemIcon: 'pencil.and.outline',
        destructive: true
      },
      {
        id: 'status-mute',
        title: t('status.mute.action', {
          context: status.muted.toString()
        }),
        systemIcon: status.muted ? 'speaker' : 'speaker.slash'
      }
    ]

    const canEditPost = useSelector(checkInstanceFeature('edit_post'))
    if (canEditPost) {
      accountMenuItems.unshift({
        id: 'status-edit',
        title: t('status.edit.action'),
        systemIcon: 'square.and.pencil'
      })
    }

    if (status.visibility === 'public' || status.visibility === 'unlisted') {
      accountMenuItems.push({
        id: 'status-pin',
        title: t('status.pin.action', {
          context: status.pinned.toString()
        }),
        systemIcon: status.pinned ? 'pin.slash' : 'pin'
      })
    }

    actions.push(...accountMenuItems)
  }

  return async (index: number) => {
    if (actions[index].id === 'status-delete') {
      analytics('timeline_shared_headeractions_status_delete_press', {
        page: queryKey && queryKey[1].page
      })
      Alert.alert(
        t('status.delete.alert.title'),
        t('status.delete.alert.message'),
        [
          {
            text: t('status.delete.alert.buttons.confirm'),
            style: 'destructive',
            onPress: async () => {
              analytics('timeline_shared_headeractions_status_delete_confirm', {
                page: queryKey && queryKey[1].page
              })
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
            text: t('common:buttons.cancel')
          }
        ]
      )
    }
    if (actions[index].id === 'status-delete-edit') {
      analytics('timeline_shared_headeractions_status_deleteedit_press', {
        page: queryKey && queryKey[1].page
      })
      Alert.alert(
        t('status.deleteEdit.alert.title'),
        t('status.deleteEdit.alert.message'),
        [
          {
            text: t('status.deleteEdit.alert.buttons.confirm'),
            style: 'destructive',
            onPress: async () => {
              analytics(
                'timeline_shared_headeractions_status_deleteedit_confirm',
                {
                  page: queryKey && queryKey[1].page
                }
              )
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
      )
    }
    if (actions[index].id === 'status-mute') {
      analytics('timeline_shared_headeractions_status_mute_press', {
        page: queryKey && queryKey[1].page
      })
      mutation.mutate({
        type: 'updateStatusProperty',
        queryKey,
        rootQueryKey,
        id: status.id,
        payload: {
          property: 'muted',
          currentValue: status.muted,
          propertyCount: undefined,
          countValue: undefined
        }
      })
    }
    if (actions[index].id === 'status-edit') {
      analytics('timeline_shared_headeractions_status_edit_press', {
        page: queryKey && queryKey[1].page
      })
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
    }
    if (actions[index].id === 'status-pin') {
      // Also note that reblogs cannot be pinned.
      analytics('timeline_shared_headeractions_status_pin_press', {
        page: queryKey && queryKey[1].page
      })
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
      })
    }
  }
}

export default contextMenuStatus
