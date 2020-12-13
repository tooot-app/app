import React, { useCallback, useMemo } from 'react'
import { ActionSheetIOS, Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryCache } from 'react-query'
import { Feather } from '@expo/vector-icons'

import client from '@api/client'
import { useTheme } from '@utils/styles/ThemeManager'
import { toast } from '@components/toast'
import { StyleConstants } from '@utils/styles/constants'
import { useNavigation } from '@react-navigation/native'
import getCurrentTab from '@utils/getCurrentTab'

const fireMutation = async ({
  id,
  type,
  stateKey,
  prevState
}: {
  id: string
  type: 'favourite' | 'reblog' | 'bookmark'
  stateKey: 'favourited' | 'reblogged' | 'bookmarked'
  prevState?: boolean
}) => {
  let res
  switch (type) {
    case 'favourite':
    case 'reblog':
    case 'bookmark':
      res = await client({
        method: 'post',
        instance: 'local',
        url: `statuses/${id}/${prevState ? 'un' : ''}${type}`
      }) // bug in response from Mastodon

      if (!res.body[stateKey] === prevState) {
        toast({ type: 'success', content: '功能成功' })
        return Promise.resolve(res.body)
      } else {
        toast({ type: 'error', content: '功能错误' })
        return Promise.reject()
      }
      break
  }
}

export interface Props {
  queryKey: App.QueryKey
  status: Mastodon.Status
}

const TimelineActions: React.FC<Props> = ({ queryKey, status }) => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const iconColor = theme.secondary
  const iconColorAction = (state: boolean) =>
    state ? theme.primary : theme.secondary

  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: ({ id, type, stateKey, prevState }) => {
      queryCache.cancelQueries(queryKey)
      const oldData = queryCache.getQueryData(queryKey)

      switch (type) {
        case 'favourite':
        case 'reblog':
        case 'bookmark':
          queryCache.setQueryData(queryKey, old =>
            (old as {}[]).map((paging: any) => ({
              toots: paging.toots.map((toot: any) => {
                if (toot.id === id) {
                  toot[stateKey] =
                    typeof prevState === 'boolean' ? !prevState : true
                }
                return toot
              }),
              pointer: paging.pointer
            }))
          )
          break
      }

      return oldData
    },
    onError: (err, _, oldData) => {
      toast({ type: 'error', content: '请重试' })
      queryCache.setQueryData(queryKey, oldData)
    }
  })

  const onPressReply = useCallback(() => {
    navigation.navigate(getCurrentTab(navigation), {
      screen: 'Screen-Shared-Compose',
      params: {
        type: status.visibility === 'direct' ? 'conversation' : 'reply',
        incomingStatus: status
      }
    })
  }, [])
  const onPressReblog = useCallback(
    () =>
      mutateAction({
        id: status.id,
        type: 'reblog',
        stateKey: 'reblogged',
        prevState: status.reblogged
      }),
    [status.reblogged]
  )
  const onPressFavourite = useCallback(
    () =>
      mutateAction({
        id: status.id,
        type: 'favourite',
        stateKey: 'favourited',
        prevState: status.favourited
      }),
    [status.favourited]
  )
  const onPressBookmark = useCallback(
    () =>
      mutateAction({
        id: status.id,
        type: 'bookmark',
        stateKey: 'bookmarked',
        prevState: status.bookmarked
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
        () => {},
        () => {}
      ),
    []
  )

  const childrenReply = useMemo(
    () => (
      <>
        <Feather
          name='message-circle'
          color={iconColor}
          size={StyleConstants.Font.Size.M + 2}
        />
        {status.replies_count > 0 && (
          <Text
            style={{
              color: theme.secondary,
              fontSize: StyleConstants.Font.Size.M,
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
      <Feather
        name='repeat'
        color={
          status.visibility === 'public' || status.visibility === 'unlisted'
            ? iconColorAction(status.reblogged)
            : theme.disabled
        }
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.reblogged]
  )
  const childrenFavourite = useMemo(
    () => (
      <Feather
        name='heart'
        color={iconColorAction(status.favourited)}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.favourited]
  )
  const childrenBookmark = useMemo(
    () => (
      <Feather
        name='bookmark'
        color={iconColorAction(status.bookmarked)}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.bookmarked]
  )
  const childrenShare = useMemo(
    () => (
      <Feather
        name='share-2'
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
          onPress={
            status.visibility === 'public' || status.visibility === 'unlisted'
              ? onPressReblog
              : null
          }
          children={childrenReblog}
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
    marginTop: StyleConstants.Spacing.M
  },
  action: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default TimelineActions
