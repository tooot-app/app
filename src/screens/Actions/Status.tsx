import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from 'react-query'
import { MenuContainer, MenuHeader, MenuRow } from '@components/Menu'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import analytics from '@components/analytics'
import { displayMessage } from '@components/Message'
import { useTheme } from '@utils/styles/ThemeManager'
import apiInstance from '@api/instance'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@utils/navigation/navigators'
import { useSelector } from 'react-redux'
import { checkInstanceFeature } from '@utils/slices/instancesSlice'

export interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Screen-Actions'>
  queryKey: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  status: Mastodon.Status
  dismiss: () => void
}

const ActionsStatus: React.FC<Props> = ({
  navigation,
  queryKey,
  rootQueryKey,
  status,
  dismiss
}) => {
  const { theme } = useTheme()
  const { t } = useTranslation('componentTimeline')

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
          function: t(`shared.header.actions.status.${theFunction}.function`)
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

  const canEditPost = useSelector(checkInstanceFeature('edit_post'))

  return (
    <MenuContainer>
      <MenuHeader heading={t('shared.header.actions.status.heading')} />
      {canEditPost ? (
        <MenuRow
          onPress={async () => {
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
              dismiss()
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
          }}
          iconFront='Edit3'
          title={t('shared.header.actions.status.edit.button')}
        />
      ) : null}
      <MenuRow
        onPress={() => {
          analytics('timeline_shared_headeractions_status_delete_press', {
            page: queryKey && queryKey[1].page
          })
          Alert.alert(
            t('shared.header.actions.status.delete.alert.title'),
            t('shared.header.actions.status.delete.alert.message'),
            [
              {
                text: t(
                  'shared.header.actions.status.delete.alert.buttons.cancel'
                ),
                style: 'cancel'
              },
              {
                text: t(
                  'shared.header.actions.status.delete.alert.buttons.confirm'
                ),
                style: 'destructive',
                onPress: async () => {
                  analytics(
                    'timeline_shared_headeractions_status_delete_confirm',
                    {
                      page: queryKey && queryKey[1].page
                    }
                  )
                  dismiss()
                  mutation.mutate({
                    type: 'deleteItem',
                    source: 'statuses',
                    queryKey,
                    rootQueryKey,
                    id: status.id
                  })
                }
              }
            ]
          )
        }}
        iconFront='Trash'
        title={t('shared.header.actions.status.delete.button')}
      />
      <MenuRow
        onPress={() => {
          analytics('timeline_shared_headeractions_status_deleteedit_press', {
            page: queryKey && queryKey[1].page
          })
          Alert.alert(
            t('shared.header.actions.status.deleteEdit.alert.title'),
            t('shared.header.actions.status.deleteEdit.alert.message'),
            [
              {
                text: t(
                  'shared.header.actions.status.deleteEdit.alert.buttons.cancel'
                ),
                style: 'cancel'
              },
              {
                text: t(
                  'shared.header.actions.status.deleteEdit.alert.buttons.confirm'
                ),
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
                      dismiss()
                      navigation.navigate('Screen-Compose', {
                        type: 'deleteEdit',
                        incomingStatus: res.body as Mastodon.Status,
                        ...(replyToStatus && { replyToStatus }),
                        queryKey
                      })
                    })
                }
              }
            ]
          )
        }}
        iconFront='Edit'
        title={t('shared.header.actions.status.deleteEdit.button')}
      />
      <MenuRow
        onPress={() => {
          analytics('timeline_shared_headeractions_status_mute_press', {
            page: queryKey && queryKey[1].page
          })
          dismiss()
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
        }}
        iconFront='VolumeX'
        title={
          status.muted
            ? t('shared.header.actions.status.mute.button.negative')
            : t('shared.header.actions.status.mute.button.positive')
        }
      />
      {/* Also note that reblogs cannot be pinned. */}
      {(status.visibility === 'public' || status.visibility === 'unlisted') && (
        <MenuRow
          onPress={() => {
            analytics('timeline_shared_headeractions_status_pin_press', {
              page: queryKey && queryKey[1].page
            })
            dismiss()
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
          }}
          iconFront='Anchor'
          title={
            status.pinned
              ? t('shared.header.actions.status.pin.button.negative')
              : t('shared.header.actions.status.pin.button.positive')
          }
        />
      )}
    </MenuContainer>
  )
}

export default ActionsStatus
