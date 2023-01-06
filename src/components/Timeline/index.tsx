import ComponentSeparator from '@components/Separator'
import { useScrollToTop } from '@react-navigation/native'
import { UseInfiniteQueryOptions } from '@tanstack/react-query'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { flattenPages } from '@utils/queryHooks/utils'
import { useGlobalStorageListener } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useRef } from 'react'
import { FlatList, FlatListProps, Platform, RefreshControl } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import TimelineEmpty from './Empty'
import TimelineFooter from './Footer'
import TimelineRefresh, { SEPARATION_Y_1, SEPARATION_Y_2 } from './Refresh'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export interface Props {
  flRef?: RefObject<FlatList<any>>
  queryKey: QueryKeyTimeline
  queryOptions?: Omit<
    UseInfiniteQueryOptions<any>,
    'notifyOnChangeProps' | 'getNextPageParam' | 'getPreviousPageParam' | 'select' | 'onSuccess'
  >
  disableRefresh?: boolean
  disableInfinity?: boolean
  customProps: Partial<FlatListProps<any>> & Pick<FlatListProps<any>, 'renderItem'>
}

const Timeline: React.FC<Props> = ({
  flRef: customFLRef,
  queryKey,
  queryOptions,
  disableRefresh = false,
  disableInfinity = false,
  customProps
}) => {
  const { colors } = useTheme()

  const { data, refetch, isFetching, isLoading, fetchNextPage, isFetchingNextPage } =
    useTimelineQuery({
      ...queryKey[1],
      options: {
        ...queryOptions,
        notifyOnChangeProps: Platform.select({
          ios: ['dataUpdatedAt', 'isFetching'],
          android: ['dataUpdatedAt', 'isFetching', 'isLoading']
        }),
        getNextPageParam: lastPage =>
          lastPage?.links?.next && {
            ...(lastPage.links.next.isOffset
              ? { offset: lastPage.links.next.id }
              : { max_id: lastPage.links.next.id })
          }
      }
    })

  const flRef = useRef<FlatList>(null)

  const scrollY = useSharedValue(0)
  const fetchingType = useSharedValue<0 | 1 | 2>(0)

  const onScroll = useAnimatedScrollHandler(
    {
      onScroll: ({ contentOffset: { y } }) => {
        scrollY.value = y
      },
      onEndDrag: ({ contentOffset: { y } }) => {
        if (!disableRefresh && !isFetching) {
          if (y <= SEPARATION_Y_2) {
            fetchingType.value = 2
          } else if (y <= SEPARATION_Y_1) {
            fetchingType.value = 1
          }
        }
      }
    },
    [isFetching]
  )

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
  useGlobalStorageListener('account.active', () =>
    flRef.current?.scrollToOffset({ offset: 0, animated: false })
  )

  return (
    <>
      <TimelineRefresh
        flRef={flRef}
        queryKey={queryKey}
        scrollY={scrollY}
        fetchingType={fetchingType}
        disableRefresh={disableRefresh}
      />
      <AnimatedFlatList
        ref={customFLRef || flRef}
        scrollEventThrottle={16}
        onScroll={onScroll}
        windowSize={7}
        data={flattenPages(data)}
        initialNumToRender={6}
        maxToRenderPerBatch={3}
        onEndReached={() => !disableInfinity && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.75}
        ListFooterComponent={
          <TimelineFooter queryKey={queryKey} disableInfinity={disableInfinity} />
        }
        ListEmptyComponent={<TimelineEmpty queryKey={queryKey} />}
        ItemSeparatorComponent={({ leadingItem }) =>
          queryKey[1].page === 'Toot' && queryKey[1].toot === leadingItem.id ? (
            <ComponentSeparator extraMarginLeft={0} />
          ) : (
            <ComponentSeparator
              extraMarginLeft={StyleConstants.Avatar.M + StyleConstants.Spacing.S}
            />
          )
        }
        maintainVisibleContentPosition={
          isFetching
            ? {
                minIndexForVisible: 0
              }
            : undefined
        }
        {...androidRefreshControl}
        {...customProps}
      />
    </>
  )
}

export default Timeline
