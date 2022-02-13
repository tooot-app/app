import ComponentSeparator from '@components/Separator'
import { useScrollToTop } from '@react-navigation/native'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import {
  getInstanceActive,
  updateInstanceTimelineLookback
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useCallback, useRef } from 'react'
import {
  FlatList,
  FlatListProps,
  Platform,
  RefreshControl,
  StyleSheet,
  ViewabilityConfigCallbackPairs
} from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import TimelineEmpty from './Timeline/Empty'
import TimelineFooter from './Timeline/Footer'
import TimelineRefresh, {
  SEPARATION_Y_1,
  SEPARATION_Y_2
} from './Timeline/Refresh'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

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
  lookback,
  customProps
}) => {
  const { colors } = useTheme()

  const {
    data,
    refetch,
    isFetching,
    isLoading,
    fetchNextPage,
    isFetchingNextPage
  } = useTimelineQuery({
    ...queryKey[1],
    options: {
      notifyOnChangeProps: Platform.select({
        ios: ['dataUpdatedAt', 'isFetching'],
        android: ['dataUpdatedAt', 'isFetching', 'isLoading']
      }),
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

  const dispatch = useDispatch()
  const viewabilityPairs = useRef<ViewabilityConfigCallbackPairs>([
    {
      viewabilityConfig: {
        minimumViewTime: 10,
        viewAreaCoveragePercentThreshold: 10
      },
      onViewableItemsChanged: ({ viewableItems }) => {
        lookback &&
          dispatch(
            updateInstanceTimelineLookback({
              [lookback]: {
                queryKey,
                ids: viewableItems.map(item => item.key).slice(0, 3)
              }
            })
          )
      }
    }
  ])

  useScrollToTop(flRef)
  useSelector(getInstanceActive, (prev, next) => {
    if (prev !== next) {
      flRef.current?.scrollToOffset({ offset: 0, animated: false })
    }
    return prev === next
  })

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
        data={flattenData}
        initialNumToRender={6}
        maxToRenderPerBatch={3}
        style={styles.flatList}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.75}
        ListFooterComponent={
          <TimelineFooter
            queryKey={queryKey}
            disableInfinity={disableInfinity}
          />
        }
        ListEmptyComponent={<TimelineEmpty queryKey={queryKey} />}
        ItemSeparatorComponent={ItemSeparatorComponent}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0
        }}
        {...(lookback && {
          viewabilityConfigCallbackPairs: viewabilityPairs.current
        })}
        {...androidRefreshControl}
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
