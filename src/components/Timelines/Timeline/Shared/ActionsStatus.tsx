import React, { useCallback, useMemo, useState } from 'react'
import { ActionSheetIOS, Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryCache } from 'react-query'
import { Feather } from '@expo/vector-icons'

import client from 'src/api/client'
import { getLocalAccountId } from 'src/utils/slices/instancesSlice'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { toast } from 'src/components/toast'
import { useSelector } from 'react-redux'
import { StyleConstants } from 'src/utils/styles/constants'
import BottomSheet from 'src/components/BottomSheet'
import BottomSheetRow from 'src/components/BottomSheet/Row'

const fireMutation = async ({
  id,
  type,
  stateKey,
  prevState
}: {
  id: string
  type: 'favourite' | 'reblog' | 'bookmark' | 'mute' | 'pin' | 'delete'
  stateKey:
    | 'favourited'
    | 'reblogged'
    | 'bookmarked'
    | 'muted'
    | 'pinned'
    | 'id'
  prevState?: boolean
}) => {
  let res
  switch (type) {
    case 'favourite':
    case 'reblog':
    case 'bookmark':
    case 'mute':
    case 'pin':
      res = await client({
        method: 'post',
        instance: 'local',
        endpoint: `statuses/${id}/${prevState ? 'un' : ''}${type}`
      }) // bug in response from Mastodon

      if (!res.body[stateKey] === prevState) {
        toast({ type: 'success', content: '功能成功' })
        return Promise.resolve(res.body)
      } else {
        toast({ type: 'error', content: '功能错误' })
        return Promise.reject()
      }
      break
    case 'delete':
      res = await client({
        method: 'delete',
        instance: 'local',
        endpoint: `statuses/${id}`
      })

      if (res.body[stateKey] === id) {
        toast({ type: 'success', content: '删除成功' })
        return Promise.resolve(res.body)
      } else {
        toast({ type: 'error', content: '删除失败' })
        return Promise.reject()
      }
      break
  }
}

export interface Props {
  queryKey: App.QueryKey
  status: Mastodon.Status
}

const ActionsStatus: React.FC<Props> = ({ queryKey, status }) => {
  const { theme } = useTheme()
  const iconColor = theme.secondary
  const iconColorAction = (state: boolean) =>
    state ? theme.primary : theme.secondary

  const localAccountId = useSelector(getLocalAccountId)
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false)

  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: ({ id, type, stateKey, prevState }) => {
      queryCache.cancelQueries(queryKey)
      const oldData = queryCache.getQueryData(queryKey)

      switch (type) {
        case 'favourite':
        case 'reblog':
        case 'bookmark':
        case 'mute':
        case 'pin':
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
        case 'delete':
          queryCache.setQueryData(queryKey, old =>
            (old as {}[]).map((paging: any) => ({
              toots: paging.toots.map((toot: any, index: number) => {
                if (toot.id === id) {
                  paging.toots.splice(index, 1)
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

  const onPressReply = useCallback(() => {}, [])
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
  const onPressShare = useCallback(() => setBottomSheetVisible(true), [])

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

      <BottomSheet
        visible={bottomSheetVisible}
        handleDismiss={() => setBottomSheetVisible(false)}
      >
        <BottomSheetRow
          onPress={() => {
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
              () => {
                setBottomSheetVisible(false)
                toast({ type: 'success', content: '分享成功' })
              }
            )
          }}
          icon='share'
          text={'分享嘟嘟'}
        />
        {status.account.id === localAccountId && (
          <BottomSheetRow
            onPress={() => {
              setBottomSheetVisible(false)
              mutateAction({
                id: status.id,
                type: 'delete',
                stateKey: 'id'
              })
            }}
            icon='trash'
            text='删除嘟嘟'
          />
        )}
        {status.account.id === localAccountId && (
          <BottomSheetRow
            onPress={() => {
              console.warn('功能未开发')
            }}
            icon='trash'
            text='删除并重发'
          />
        )}
        <BottomSheetRow
          onPress={() => {
            setBottomSheetVisible(false)
            mutateAction({
              id: status.id,
              type: 'mute',
              stateKey: 'muted',
              prevState: status.muted
            })
          }}
          icon='volume-x'
          text={status.muted ? '取消静音' : '静音'}
        />
        {/* Also note that reblogs cannot be pinned. */}
        {status.account.id === localAccountId && (
          <BottomSheetRow
            onPress={() => {
              setBottomSheetVisible(false)
              mutateAction({
                id: status.id,
                type: 'pin',
                stateKey: 'pinned',
                prevState: status.pinned
              })
            }}
            icon='anchor'
            text={status.pinned ? '取消置顶' : '置顶'}
          />
        )}
      </BottomSheet>
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
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  modalSheet: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    flex: 1
  }
})

export default ActionsStatus
