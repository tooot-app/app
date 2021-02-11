import ComponentSeparator from '@components/Separator'
import { useScrollToTop } from '@react-navigation/native'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { findIndex } from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatListProps, StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { InfiniteData, useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'
import haptics from './haptics'
import TimelineConversation from './Timeline/Conversation'
import TimelineDefault from './Timeline/Default'
import TimelineEmpty from './Timeline/Empty'
import TimelineEnd from './Timeline/End'
import TimelineNotifications from './Timeline/Notifications'
import TimelineRefresh from './Timeline/Refresh'

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
  // Update timeline when account switched
  useSelector(getLocalActiveIndex)
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
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useTimelineQuery({
    ...queryKeyParams,
    options: {
      getPreviousPageParam: firstPage =>
        firstPage.links?.prev && {
          min_id: firstPage.links.prev,
          // https://github.com/facebook/react-native/issues/25239#issuecomment-731100372
          limit: '3'
        },
      getNextPageParam: lastPage =>
        lastPage.links?.next && { max_id: lastPage.links.next }
    }
  })

  const flattenData = data?.pages ? data.pages.flatMap(d => [...d.body]) : []

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
  const renderItem = useCallback(
    ({ item }) => {
      switch (page) {
        case 'Conversations':
          return (
            <TimelineConversation conversation={item} queryKey={queryKey} />
          )
        case 'Notifications':
          return (
            <TimelineNotifications notification={item} queryKey={queryKey} />
          )
        default:
          return (
            <TimelineDefault
              item={item}
              queryKey={queryKey}
              {...(toot === item.id && { highlighted: true })}
              {...(data?.pages[0].pinned && { pinned: data?.pages[0].pinned })}
            />
          )
      }
    },
    [data?.pages[0]]
  )
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
  const ListFooterComponent = useMemo(
    () => <TimelineEnd hasNextPage={!disableInfinity ? hasNextPage : false} />,
    [hasNextPage]
  )

  const onScrollToIndexFailed = useCallback(error => {
    const offset = error.averageItemLength * error.index
    flRef.current?.scrollToOffset({ offset })
    setTimeout(
      () =>
        flRef.current?.scrollToIndex({ index: error.index, viewOffset: 100 }),
      350
    )
  }, [])

  useScrollToTop(flRef)
  const queryClient = useQueryClient()
  const scrollY = useSharedValue(0)
  const [isFetchingLatest, setIsFetchingLatest] = useState(false)
  useEffect(() => {
    // https://github.com/facebook/react-native/issues/25239#issuecomment-731100372
    if (isFetchingLatest) {
      if (!isFetchingPreviousPage) {
        fetchPreviousPage()
      } else {
        if (data?.pages[0].body.length === 0) {
          setIsFetchingLatest(false)
          queryClient.setQueryData<InfiniteData<any> | undefined>(
            queryKey,
            data => {
              if (data?.pages[0].body.length === 0) {
                return {
                  pages: data.pages.slice(1),
                  pageParams: data.pageParams.slice(1)
                }
              } else {
                return data
              }
            }
          )
        }
      }
    }
  }, [isFetchingPreviousPage, isFetchingLatest, data?.pages[0].body])
  const onScroll = useCallback(({ nativeEvent }) => {
    scrollY.value = nativeEvent.contentOffset.y
  }, [])
  const onResponderRelease = useCallback(() => {
    if (
      scrollY.value <= -StyleConstants.Spacing.XL &&
      !isFetchingLatest &&
      !disableRefresh
    ) {
      haptics('Light')
      setIsFetchingLatest(true)
      flRef.current?.scrollToOffset({
        animated: true,
        offset: 1
      })
    }
  }, [scrollY.value, isFetchingLatest, disableRefresh])
  const headerPadding = useAnimatedStyle(() => {
    if (isFetchingLatest) {
      return { paddingTop: withTiming(StyleConstants.Spacing.XL) }
    } else {
      return { paddingTop: withTiming(0) }
    }
  }, [isFetchingLatest])
  const ListHeaderComponent = useMemo(
    () => <Animated.View style={headerPadding} />,
    []
  )

  return (
    <>
      <TimelineRefresh isLoading={isLoading} disable={disableRefresh} />
      <FlatList
        onScroll={onScroll}
        onResponderRelease={onResponderRelease}
        ref={flRef}
        windowSize={8}
        data={flattenData}
        initialNumToRender={6}
        maxToRenderPerBatch={3}
        style={styles.flatList}
        renderItem={renderItem}
        onEndReached={onEndReached}
        keyExtractor={keyExtractor}
        onEndReachedThreshold={0.75}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={flItemEmptyComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        {...(toot && isSuccess && { onScrollToIndexFailed })}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0
        }}
        {...customProps}
      />
    </>
  )
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

export default Timeline
