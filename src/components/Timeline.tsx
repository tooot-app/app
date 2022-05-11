import ComponentSeparator from '@components/Separator'
import { useScrollToTop } from '@react-navigation/native'
import {
  QueryKeyTimeline,
  TimelineData,
  useTimelineQuery
} from '@utils/queryHooks/timeline'
import { getInstanceActive } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useCallback, useRef } from 'react'
import {
  FlatList,
  FlatListProps,
  Platform,
  RefreshControl,
  StyleSheet
} from 'react-native'
import { InfiniteData, useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'
import TimelineEmpty from './Timeline/Empty'
import TimelineFooter from './Timeline/Footer'

export interface Props {
  flRef?: RefObject<FlatList<any>>
  queryKey: QueryKeyTimeline
  disableRefresh?: boolean
  disableInfinity?: boolean
  lookback?: Extract<App.Pages, 'Following' | 'Local' | 'LocalPublic'>
  customProps: Partial<FlatListProps<any>> &
    Pick<FlatListProps<any>, 'renderItem'>
}

const Timeline: React.FC<Props> = ({
  flRef: customFLRef,
  queryKey,
  disableRefresh = false,
  disableInfinity = false,
  customProps
}) => {
  const { colors } = useTheme()

  const queryClient = useQueryClient()
  const {
    data,
    refetch,
    isFetching,
    isLoading,
    fetchPreviousPage,
    fetchNextPage,
    isFetchingPreviousPage,
    isFetchingNextPage
  } = useTimelineQuery({
    ...queryKey[1],
    options: {
      notifyOnChangeProps: Platform.select({
        ios: ['dataUpdatedAt', 'isFetching'],
        android: ['dataUpdatedAt', 'isFetching', 'isLoading']
      }),
      getPreviousPageParam: firstPage =>
        firstPage?.links?.prev && {
          min_id: firstPage.links.prev,
          // https://github.com/facebook/react-native/issues/25239
          limit: '10'
        },
      getNextPageParam: lastPage =>
        lastPage?.links?.next && {
          max_id: lastPage.links.next
        }
    }
  })

  const flattenData = data?.pages
    ? data.pages?.flatMap(page => [...page.body])
    : []

  const ItemSeparatorComponent = useCallback(
    ({ leadingItem }) =>
      queryKey[1].page === 'Toot' && queryKey[1].toot === leadingItem.id ? (
        <ComponentSeparator extraMarginLeft={0} />
      ) : (
        <ComponentSeparator
          extraMarginLeft={StyleConstants.Avatar.M + StyleConstants.Spacing.S}
        />
      ),
    []
  )
  const onEndReached = useCallback(
    () => !disableInfinity && !isFetchingNextPage && fetchNextPage(),
    [isFetchingNextPage]
  )

  const flRef = useRef<FlatList>(null)

  const androidRefreshControl = Platform.select({
    android: {
      refreshControl: (
        <RefreshControl
          enabled
          colors={[colors.primaryDefault]}
          progressBackgroundColor={colors.backgroundDefault}
          refreshing={isFetching || isLoading}
          onRefresh={() => refetch()}
        />
      )
    }
  })

  useScrollToTop(flRef)
  useSelector(getInstanceActive, (prev, next) => {
    if (prev !== next) {
      flRef.current?.scrollToOffset({ offset: 0, animated: false })
    }
    return prev === next
  })

  return (
    <FlatList
      ref={customFLRef || flRef}
      scrollEventThrottle={16}
      windowSize={7}
      data={flattenData}
      initialNumToRender={6}
      maxToRenderPerBatch={3}
      style={styles.flatList}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.75}
      ListFooterComponent={
        <TimelineFooter queryKey={queryKey} disableInfinity={disableInfinity} />
      }
      ListEmptyComponent={<TimelineEmpty queryKey={queryKey} />}
      ItemSeparatorComponent={ItemSeparatorComponent}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      refreshing={isFetchingPreviousPage}
      onRefresh={() => {
        if (!disableRefresh && !isFetchingPreviousPage) {
          queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(
            queryKey,
            data => {
              if (data?.pages[0] && data.pages[0].body.length === 0) {
                return {
                  pages: data.pages.slice(1),
                  pageParams: data.pageParams.slice(1)
                }
              } else {
                return data
              }
            }
          )
          fetchPreviousPage()
        }
      }}
      {...androidRefreshControl}
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
