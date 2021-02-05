import ComponentSeparator from '@components/Separator'
import { useNavigation, useScrollToTop } from '@react-navigation/native'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { getPublicRemoteNotice } from '@utils/slices/contextsSlice'
import { localUpdateNotification } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { findIndex } from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  FlatListProps,
  Platform,
  RefreshControl,
  StyleSheet
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import TimelineConversation from './Timeline/Conversation'
import TimelineDefault from './Timeline/Default'
import TimelineEmpty from './Timeline/Empty'
import TimelineEnd from './Timeline/End'
import TimelineNotifications from './Timeline/Notifications'

export interface Props {
  page: App.Pages
  hashtag?: Mastodon.Tag['name']
  list?: Mastodon.List['id']
  toot?: Mastodon.Status['id']
  account?: Mastodon.Account['id']
  disableRefresh?: boolean
  disableInfinity?: boolean
  customProps?: Partial<FlatListProps<any>>
}

const Timeline: React.FC<Props> = ({
  page,
  hashtag,
  list,
  toot,
  account,
  disableRefresh = false,
  disableInfinity = false,
  customProps
}) => {
  const queryKeyParams = {
    page,
    ...(hashtag && { hashtag }),
    ...(list && { list }),
    ...(toot && { toot }),
    ...(account && { account })
  }
  const queryKey: QueryKeyTimeline = ['Timeline', queryKeyParams]
  const {
    status,
    data,
    refetch,
    isSuccess,
    isFetching,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useTimelineQuery({
    ...queryKeyParams,
    options: {
      getNextPageParam: lastPage => {
        return Array.isArray(lastPage) && lastPage.length
          ? {
              direction: 'next',
              id: lastPage[lastPage.length - 1].last_status
                ? lastPage[lastPage.length - 1].last_status.id
                : lastPage[lastPage.length - 1].id
            }
          : undefined
      }
    }
  })

  const flattenData = data?.pages ? data.pages.flatMap(d => [...d]) : []

  // Clear unread notification badge
  const dispatch = useDispatch()
  const navigation = useNavigation()
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', props => {
      if (props.target && props.target.includes('Tab-Notifications-Root')) {
        if (flattenData.length) {
          dispatch(
            localUpdateNotification({
              latestTime: (flattenData[0] as Mastodon.Notification).created_at
            })
          )
        }
      }
    })

    return unsubscribe
  }, [navigation, flattenData])

  const flRef = useRef<FlatList<any>>(null)
  const scrolled = useRef(false)
  useEffect(() => {
    if (toot && isSuccess && !scrolled.current) {
      scrolled.current = true
      const pointer = findIndex(flattenData, ['id', toot])
      setTimeout(() => {
        flRef.current?.scrollToIndex({
          index: pointer,
          viewOffset: 100
        })
      }, 500)
    }
  }, [isSuccess, flattenData.length, scrolled])

  const keyExtractor = useCallback(({ id }) => id, [])
  const renderItem = useCallback(({ item }) => {
    switch (page) {
      case 'Conversations':
        return <TimelineConversation conversation={item} queryKey={queryKey} />
      case 'Notifications':
        return <TimelineNotifications notification={item} queryKey={queryKey} />
      default:
        return (
          <TimelineDefault
            item={item}
            queryKey={queryKey}
            {...(queryKey[1].page === 'RemotePublic' && {
              disableDetails: true,
              disableOnPress: true
            })}
            {...(toot === item.id && { highlighted: true })}
          />
        )
    }
  }, [])
  const ItemSeparatorComponent = useCallback(
    ({ leadingItem }) => (
      <ComponentSeparator
        {...(toot === leadingItem.id
          ? { extraMarginLeft: 0 }
          : {
              extraMarginLeft:
                StyleConstants.Avatar.M + StyleConstants.Spacing.S
            })}
      />
    ),
    []
  )
  const flItemEmptyComponent = useMemo(
    () => <TimelineEmpty status={status} refetch={refetch} />,
    [status]
  )
  const onEndReached = useCallback(
    () => !disableInfinity && !isFetchingNextPage && fetchNextPage(),
    [isFetchingNextPage]
  )
  const ListFooterComponent = useCallback(
    () => <TimelineEnd hasNextPage={!disableInfinity ? hasNextPage : false} />,
    [hasNextPage]
  )

  const isSwipeDown = useRef(false)
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        {...(Platform.OS === 'android' && { enabled: true })}
        refreshing={
          Platform.OS === 'android'
            ? (isSwipeDown.current && isFetching && !isFetchingNextPage) ||
              isLoading
            : isSwipeDown.current &&
              isFetching &&
              !isFetchingNextPage &&
              !isLoading
        }
        onRefresh={() => {
          isSwipeDown.current = true
          refetch()
        }}
      />
    ),
    [isSwipeDown.current, isFetching, isFetchingNextPage, isLoading]
  )

  useEffect(() => {
    if (!isFetching) {
      isSwipeDown.current = false
    }
  }, [isFetching])

  const onScrollToIndexFailed = useCallback(error => {
    const offset = error.averageItemLength * error.index
    flRef.current?.scrollToOffset({ offset })
    setTimeout(
      () =>
        flRef.current?.scrollToIndex({ index: error.index, viewOffset: 100 }),
      350
    )
  }, [])

  const publicRemoteNotice = useSelector(getPublicRemoteNotice).hidden

  useScrollToTop(flRef)

  return (
    <FlatList
      ref={flRef}
      windowSize={8}
      data={flattenData}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      style={styles.flatList}
      renderItem={renderItem}
      onEndReached={onEndReached}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.75}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={flItemEmptyComponent}
      {...(!disableRefresh && { refreshControl })}
      ItemSeparatorComponent={ItemSeparatorComponent}
      {...(toot && isSuccess && { onScrollToIndexFailed })}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 1
      }}
      {...customProps}
    />
  )
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

export default Timeline
