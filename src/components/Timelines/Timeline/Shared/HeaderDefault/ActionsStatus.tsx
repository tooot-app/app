import { findIndex } from 'lodash'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'
import client from '@api/client'
import haptics from '@components/haptics'
import { MenuContainer, MenuHeader, MenuRow } from '@components/Menu'
import { TimelineData } from '@components/Timelines/Timeline'
import { toast } from '@components/toast'
import { useNavigation } from '@react-navigation/native'

export interface Props {
  queryKey: QueryKey.Timeline
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
  const fireMutation = useCallback(
    ({ type, state }: { type: 'mute' | 'pin' | 'delete'; state?: boolean }) => {
      switch (type) {
        case 'mute':
        case 'pin':
          return client({
            method: 'post',
            instance: 'local',
            url: `statuses/${status.id}/${state ? 'un' : ''}${type}`
          }) // bug in response from Mastodon, but onMutate ignore the error in response
          break
        case 'delete':
          return client({
            method: 'delete',
            instance: 'local',
            url: `statuses/${status.id}`
          })
          break
      }
    },
    []
  )
  enum mapTypeToProp {
    mute = 'muted',
    pin = 'pinned'
  }
  const { mutate } = useMutation(fireMutation, {
    onMutate: ({ type, state }) => {
      queryClient.cancelQueries(queryKey)
      const oldData = queryClient.getQueryData(queryKey)

      switch (type) {
        case 'mute':
        case 'pin':
          haptics('Success')
          toast({
            type: 'success',
            message: t('common:toastMessage.success.message', {
              function: t(
                `timeline:shared.header.default.actions.status.${type}.function`
              )
            })
          })
          queryClient.setQueryData<TimelineData>(queryKey, old => {
            let tootIndex = -1
            const pageIndex = findIndex(old?.pages, page => {
              const tempIndex = findIndex(page.toots, ['id', status.id])
              if (tempIndex >= 0) {
                tootIndex = tempIndex
                return true
              } else {
                return false
              }
            })

            if (pageIndex >= 0 && tootIndex >= 0) {
              old!.pages[pageIndex].toots[tootIndex][mapTypeToProp[type]] =
                typeof state === 'boolean' ? !state : true // State could be null from response
            }

            return old
          })
          break
        case 'delete':
          queryClient.setQueryData<TimelineData>(
            queryKey,
            old =>
              old && {
                ...old,
                pages: old?.pages.map(paging => ({
                  ...paging,
                  toots: paging.toots.filter(toot => toot.id !== status.id)
                }))
              }
          )
          break
      }

      return oldData
    },
    onError: (_, { type }, oldData) => {
      toast({
        type: 'error',
        message: t('common:toastMessage.success.message', {
          function: t(
            `timeline:shared.header.default.actions.status.${type}.function`
          )
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
          mutate({ type: 'delete' })
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
                  await client({
                    method: 'delete',
                    instance: 'local',
                    url: `statuses/${status.id}`
                  })
                    .then(res => {
                      queryClient.invalidateQueries(queryKey)
                      setBottomSheetVisible(false)
                      navigation.navigate('Screen-Shared-Compose', {
                        type: 'edit',
                        incomingStatus: res.body
                      })
                    })
                    .catch(() => {
                      toast({
                        type: 'error',
                        message: t('common:toastMessage.success.message', {
                          function: t(
                            `timeline:shared.header.default.actions.status.edit.function`
                          )
                        })
                      })
                    })
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
          mutate({ type: 'mute', state: status.muted })
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
            mutate({ type: 'pin', state: status.pinned })
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
