import client from '@api/client'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { TimelineData } from '@components/Timelines/Timeline'
import { toast } from '@components/toast'
import { useNavigation } from '@react-navigation/native'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { findIndex } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionSheetIOS, Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  status: Mastodon.Status
  reblog: boolean
}

const TimelineActions: React.FC<Props> = ({ queryKey, status, reblog }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const iconColor = theme.secondary
  const iconColorAction = (state: boolean) =>
    state ? theme.primary : theme.secondary

  const queryClient = useQueryClient()
  const fireMutation = useCallback(
    async ({
      type,
      state
    }: {
      type: 'favourite' | 'reblog' | 'bookmark'
      stateKey: 'favourited' | 'reblogged' | 'bookmarked'
      state?: boolean
    }) => {
      return client<Mastodon.Status>({
        method: 'post',
        instance: 'local',
        url: `statuses/${status.id}/${state ? 'un' : ''}${type}`
      }) // bug in response from Mastodon
    },
    []
  )
  const { mutate } = useMutation(fireMutation, {
    onMutate: ({ type, stateKey, state }) => {
      queryClient.cancelQueries(queryKey)
      const oldData = queryClient.getQueryData(queryKey)

      haptics('Success')
      switch (type) {
        case 'favourite':
        case 'reblog':
        case 'bookmark':
          queryClient.setQueryData<TimelineData>(queryKey, old => {
            let tootIndex = -1
            const pageIndex = findIndex(old?.pages, page => {
              const tempIndex = findIndex(page.toots, [
                queryKey[1].page === 'Notifications'
                  ? 'status.id'
                  : reblog
                  ? 'reblog.id'
                  : 'id',
                status.id
              ])
              if (tempIndex >= 0) {
                tootIndex = tempIndex
                return true
              } else {
                return false
              }
            })

            if (pageIndex >= 0 && tootIndex >= 0) {
              if (
                (type === 'favourite' && queryKey[1].page === 'Favourites') ||
                (type === 'bookmark' && queryKey[1].page === 'Bookmarks')
              ) {
                old!.pages[pageIndex].toots.splice(tootIndex, 1)
              } else {
                if (queryKey[1].page === 'Notifications') {
                  old!.pages[pageIndex].toots[tootIndex].status[stateKey] =
                    typeof state === 'boolean' ? !state : true
                } else {
                  if (reblog) {
                    old!.pages[pageIndex].toots[tootIndex].reblog![stateKey] =
                      typeof state === 'boolean' ? !state : true
                  } else {
                    old!.pages[pageIndex].toots[tootIndex][stateKey] =
                      typeof state === 'boolean' ? !state : true
                  }
                }
              }
            }

            return old
          })
          break
      }

      return oldData
    },
    onError: (err: any, { type }, oldData) => {
      haptics('Error')
      toast({
        type: 'error',
        message: t('common:toastMessage.error.message', {
          function: t(`timeline:shared.actions.${type}.function`)
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

  const onPressReply = useCallback(
    () =>
      navigation.navigate('Screen-Shared-Compose', {
        type: 'reply',
        incomingStatus: status
      }),
    []
  )
  const onPressReblog = useCallback(
    () =>
      mutate({
        type: 'reblog',
        stateKey: 'reblogged',
        state: status.reblogged
      }),
    [status.reblogged]
  )
  const onPressFavourite = useCallback(
    () =>
      mutate({
        type: 'favourite',
        stateKey: 'favourited',
        state: status.favourited
      }),
    [status.favourited]
  )
  const onPressBookmark = useCallback(
    () =>
      mutate({
        type: 'bookmark',
        stateKey: 'bookmarked',
        state: status.bookmarked
      }),
    [status.bookmarked]
  )
  const onPressShare = useCallback(
    () =>
      ActionSheetIOS.showShareActionSheetWithOptions(
        {
          url: status.uri,
          excludedActivityTypes: [
            'com.apple.UIKit.activity.Mail',
            'com.apple.UIKit.activity.Print',
            'com.apple.UIKit.activity.SaveToCameraRoll',
            'com.apple.UIKit.activity.OpenInIBooks'
          ]
        },
        () => haptics('Error'),
        () => haptics('Success')
      ),
    []
  )

  const childrenReply = useMemo(
    () => (
      <>
        <Icon
          name='MessageCircle'
          color={iconColor}
          size={StyleConstants.Font.Size.M + 2}
        />
        {status.replies_count > 0 && (
          <Text
            style={{
              color: theme.secondary,
              ...StyleConstants.FontStyle.M,
              marginLeft: StyleConstants.Spacing.XS
            }}
          >
            {status.replies_count}
          </Text>
        )}
      </>
    ),
    [status.replies_count]
  )
  const childrenReblog = useMemo(
    () => (
      <Icon
        name='Repeat'
        color={
          status.visibility === 'private' || status.visibility === 'direct'
            ? theme.disabled
            : iconColorAction(status.reblogged)
        }
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.reblogged]
  )
  const childrenFavourite = useMemo(
    () => (
      <Icon
        name='Heart'
        color={iconColorAction(status.favourited)}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.favourited]
  )
  const childrenBookmark = useMemo(
    () => (
      <Icon
        name='Bookmark'
        color={iconColorAction(status.bookmarked)}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.bookmarked]
  )
  const childrenShare = useMemo(
    () => (
      <Icon
        name='Share2'
        color={iconColor}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    []
  )

  return (
    <>
      <View style={styles.actions}>
        <Pressable
          style={styles.action}
          onPress={onPressReply}
          children={childrenReply}
        />

        <Pressable
          style={styles.action}
          onPress={onPressReblog}
          children={childrenReblog}
          disabled={
            status.visibility === 'private' || status.visibility === 'direct'
          }
        />

        <Pressable
          style={styles.action}
          onPress={onPressFavourite}
          children={childrenFavourite}
        />

        <Pressable
          style={styles.action}
          onPress={onPressBookmark}
          children={childrenBookmark}
        />

        <Pressable
          style={styles.action}
          onPress={onPressShare}
          children={childrenShare}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.S
  },
  action: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: StyleConstants.Spacing.S
  }
})

export default TimelineActions
