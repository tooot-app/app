import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from 'react-query'
import { MenuContainer, MenuHeader, MenuRow } from '@components/Menu'
import { toast } from '@components/toast'
import { useNavigation } from '@react-navigation/native'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'

export interface Props {
  queryKey: QueryKeyTimeline
  status: Mastodon.Status
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderDefaultActionsStatus: React.FC<Props> = ({
  queryKey,
  status,
  setBottomSheetVisible
}) => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    queryClient,
    onMutate: true,
    onError: (err: any, params, oldData) => {
      const theFunction = (params as MutationVarsTimelineUpdateStatusProperty)
        .payload
        ? (params as MutationVarsTimelineUpdateStatusProperty).payload.property
        : 'delete'
      toast({
        type: 'error',
        message: t('common:toastMessage.error.message', {
          function: t(
            `timeline:shared.header.default.actions.status.${theFunction}.function`
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
      queryClient.setQueryData(queryKey, oldData)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader
        heading={t('timeline:shared.header.default.actions.status.heading')}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutation.mutate({
            type: 'deleteItem',
            source: 'statuses',
            queryKey,
            id: status.id
          })
        }}
        iconFront='Trash'
        title={t('timeline:shared.header.default.actions.status.delete.button')}
      />
      <MenuRow
        onPress={() => {
          Alert.alert(
            t('timeline:shared.header.default.actions.status.edit.alert.title'),
            t(
              'timeline:shared.header.default.actions.status.edit.alert.message'
            ),
            [
              { text: t('common:buttons.cancel'), style: 'cancel' },
              {
                text: t(
                  'timeline:shared.header.default.actions.status.edit.alert.confirm'
                ),
                style: 'destructive',
                onPress: async () => {
                  setBottomSheetVisible(false)
                  const res = await mutation.mutateAsync({
                    type: 'deleteItem',
                    source: 'statuses',
                    queryKey,
                    id: status.id
                  })
                  if (res.id) {
                    navigation.navigate('Screen-Shared-Compose', {
                      type: 'edit',
                      incomingStatus: res
                    })
                  }
                }
              }
            ]
          )
        }}
        iconFront='Trash'
        title={t('timeline:shared.header.default.actions.status.edit.button')}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutation.mutate({
            type: 'updateStatusProperty',
            queryKey,
            id: status.id,
            payload: { property: 'muted', currentValue: status.muted }
          })
        }}
        iconFront='VolumeX'
        title={
          status.muted
            ? t(
                'timeline:shared.header.default.actions.status.mute.button.negative'
              )
            : t(
                'timeline:shared.header.default.actions.status.mute.button.positive'
              )
        }
      />
      {/* Also note that reblogs cannot be pinned. */}
      {(status.visibility === 'public' || status.visibility === 'unlisted') && (
        <MenuRow
          onPress={() => {
            setBottomSheetVisible(false)
            mutation.mutate({
              type: 'updateStatusProperty',
              queryKey,
              id: status.id,
              payload: { property: 'pinned', currentValue: status.pinned }
            })
          }}
          iconFront='Anchor'
          title={
            status.pinned
              ? t(
                  'timeline:shared.header.default.actions.status.pin.button.negative'
                )
              : t(
                  'timeline:shared.header.default.actions.status.pin.button.positive'
                )
          }
        />
      )}
    </MenuContainer>
  )
}

export default HeaderDefaultActionsStatus
