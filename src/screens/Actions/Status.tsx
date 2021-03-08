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
import { StackNavigationProp } from '@react-navigation/stack'
import { displayMessage } from '@components/Message'
import { useTheme } from '@utils/styles/ThemeManager'
import apiInstance from '@api/instance'

export interface Props {
  navigation: StackNavigationProp<Nav.RootStackParamList, 'Screen-Actions'>
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
  const { mode } = useTheme()
  const { t } = useTranslation('componentTimeline')

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    queryClient,
    onMutate: true,
    onError: (err: any, params, oldData) => {
      const theFunction = (params as MutationVarsTimelineUpdateStatusProperty)
        .payload
        ? (params as MutationVarsTimelineUpdateStatusProperty).payload.property
        : 'delete'
      displayMessage({
        mode,
        type: 'error',
        message: t('common:toastMessage.error.message', {
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

  return (
    <MenuContainer>
      <MenuHeader heading={t('shared.header.actions.status.heading')} />
      <MenuRow
        onPress={() => {
          analytics('timeline_shared_headeractions_status_delete_press', {
            page: queryKey && queryKey[1].page
          })
          dismiss()
          mutation.mutate({
            type: 'deleteItem',
            source: 'statuses',
            queryKey,
            rootQueryKey,
            id: status.id
          })
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
            t('shared.header.actions.status.edit.alert.title'),
            t('shared.header.actions.status.edit.alert.message'),
            [
              {
                text: t(
                  'shared.header.actions.status.edit.alert.buttons.cancel'
                ),
                style: 'cancel'
              },
              {
                text: t(
                  'shared.header.actions.status.edit.alert.buttons.confirm'
                ),
                style: 'destructive',
                onPress: async () => {
                  analytics(
                    'timeline_shared_headeractions_status_deleteedit_confirm',
                    {
                      page: queryKey && queryKey[1].page
                    }
                  )
                  let replyToStatus: Mastodon.Status
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
                      // @ts-ignore
                      navigation.navigate('Screen-Compose', {
                        type: 'edit',
                        incomingStatus: res.body,
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
        title={t('shared.header.actions.status.edit.button')}
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
