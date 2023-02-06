import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineDefault from '@components/Timeline/Default'
import { useNavigation, useScrollToTop } from '@react-navigation/native'
import { UseInfiniteQueryOptions } from '@tanstack/react-query'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { flattenPages } from '@utils/queryHooks/utils'
import {
  getAccountStorage,
  setAccountStorage,
  useGlobalStorageListener
} from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { throttle } from 'lodash'
import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, FlatListProps, Platform, RefreshControl } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import TimelineEmpty from './Empty'
import TimelineFooter from './Footer'
import TimelineRefresh, { SEPARATION_Y_1, SEPARATION_Y_2 } from './Refresh'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<any>)

export interface Props {
  flRef?: RefObject<FlatList<any>>
  queryKey: QueryKeyTimeline
  queryOptions?: Omit<
    UseInfiniteQueryOptions<any>,
    'notifyOnChangeProps' | 'getNextPageParam' | 'getPreviousPageParam' | 'select' | 'onSuccess'
  >
  disableRefresh?: boolean
  disableInfinity?: boolean
  readMarker?: 'read_marker_following'
  customProps?: Partial<FlatListProps<any>>
}

const Timeline: React.FC<Props> = ({
  flRef: customFLRef,
  queryKey,
  queryOptions,
  disableRefresh = false,
  disableInfinity = false,
  readMarker = undefined,
  customProps
}) => {
  const navigation = useNavigation()
  const { colors, theme } = useTheme()
  const { t } = useTranslation('componentTimeline')

  const { data, refetch, isFetching, isLoading, isRefetching, fetchNextPage, isFetchingNextPage } =
    useTimelineQuery({
      ...queryKey[1],
      options: {
        ...queryOptions,
        notifyOnChangeProps: Platform.select({
          ios: ['dataUpdatedAt', 'isFetching'],
          android: ['dataUpdatedAt', 'isFetching', 'isLoading']
        })
      }
    })

  const flRef = useRef<FlatList>(null)
  const isFetchingPrev = useSharedValue<boolean>(false)
  const [fetchedCount, setFetchedCount] = useState<number | null>(null)
  const fetchedNoticeHeight = useSharedValue<number>(100)
  const notifiedFetchedNotice = useSharedValue<boolean>(false)
  useAnimatedReaction(
    () => isFetchingPrev.value,
    (curr, prev) => {
      if (curr === true && prev === false) {
        notifiedFetchedNotice.value = true
      }
    }
  )
  useAnimatedReaction(
    () => fetchedCount,
    (curr, prev) => {
      if (curr !== null && prev === null) {
        notifiedFetchedNotice.value = false
      }
    },
    [fetchedCount]
  )
  const fetchedNoticeTop = useDerivedValue(() => {
    if (notifiedFetchedNotice.value || fetchedCount !== null) {
      return withSequence(
        withTiming(fetchedNoticeHeight.value + 16 + 4),
        withDelay(
          2000,
          withTiming(
            0,
            { easing: Easing.out(Easing.ease) },
            finished => finished && runOnJS(setFetchedCount)(null)
          )
        )
      )
    } else {
      return 0
    }
  }, [fetchedCount])
  const fetchedNoticeAnimate = useAnimatedStyle(() => ({
    transform: [{ translateY: fetchedNoticeTop.value }]
  }))

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

  const latestMarker = useRef<string>()
  const updateMarkers = useCallback(
    throttle(
      () => readMarker && setAccountStorage([{ key: readMarker, value: latestMarker.current }]),
      1000 * 15
    ),
    []
  )
  readMarker &&
    useEffect(() => {
      const unsubscribe = navigation.addListener('blur', () =>
        setAccountStorage([{ key: readMarker, value: latestMarker.current }])
      )
      return unsubscribe
    }, [])
  const viewabilityConfigCallbackPairs = useRef<
    Pick<FlatListProps<any>, 'viewabilityConfigCallbackPairs'>['viewabilityConfigCallbackPairs']
  >(
    readMarker
      ? [
          {
            viewabilityConfig: {
              minimumViewTime: 300,
              itemVisiblePercentThreshold: 80,
              waitForInteraction: false
            },
            onViewableItemsChanged: ({ viewableItems }) => {
              const marker = readMarker ? getAccountStorage.string(readMarker) : undefined

              const firstItemId = viewableItems.filter(item => item.isViewable)[0]?.item.id
              if (
                !isFetchingPrev.value &&
                !isRefetching &&
                firstItemId &&
                firstItemId > (marker || '0')
              ) {
                latestMarker.current = firstItemId
                updateMarkers()
              } else {
                // latestMarker.current = '105250709762254246'
                // updateMarkers()
              }
            }
          }
        ]
      : undefined
  )

  const androidRefreshControl = Platform.select({
    android: {
      refreshControl: (
        <RefreshControl
          enabled
          colors={[colors.primaryDefault]}
          progressBackgroundColor={colors.backgroundDefault}
          refreshing={isFetching || isLoading}
          onRefresh={() => {
            if (readMarker) {
              setAccountStorage([{ key: readMarker, value: undefined }])
            }
            refetch()
          }}
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
        isFetchingPrev={isFetchingPrev}
        setFetchedCount={setFetchedCount}
        scrollY={scrollY}
        fetchingType={fetchingType}
        disableRefresh={disableRefresh}
        readMarker={readMarker}
      />
      <AnimatedFlatList
        ref={customFLRef || flRef}
        scrollEventThrottle={16}
        onScroll={onScroll}
        windowSize={5}
        data={flattenPages(data)}
        {...(customProps?.renderItem
          ? { renderItem: customProps.renderItem }
          : { renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} /> })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        onEndReached={() => !disableInfinity && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.75}
        ListFooterComponent={
          <TimelineFooter queryKey={queryKey} disableInfinity={disableInfinity} />
        }
        ListEmptyComponent={<TimelineEmpty queryKey={queryKey} />}
        ItemSeparatorComponent={() => (
          <ComponentSeparator
            extraMarginLeft={StyleConstants.Avatar.M + StyleConstants.Spacing.S}
          />
        )}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        {...(!isLoading &&
          !isFetching && {
            maintainVisibleContentPosition: {
              minIndexForVisible: 0
            }
          })}
        {...androidRefreshControl}
        {...customProps}
      />
      {!disableRefresh ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              alignSelf: 'center',
              top: -fetchedNoticeHeight.value - 16,
              paddingVertical: StyleConstants.Spacing.S,
              paddingHorizontal: StyleConstants.Spacing.M,
              backgroundColor: colors.backgroundDefault,
              shadowColor: colors.primaryDefault,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: theme === 'light' ? 0.16 : 0.24,
              borderRadius: 99,
              justifyContent: 'center',
              alignItems: 'center'
            },
            fetchedNoticeAnimate
          ]}
          onLayout={({
            nativeEvent: {
              layout: { height }
            }
          }) => (fetchedNoticeHeight.value = height)}
        >
          <CustomText
            fontStyle='S'
            style={{ color: colors.primaryDefault }}
            children={
              fetchedCount !== null
                ? fetchedCount > 0
                  ? t('refresh.fetched.found', { count: fetchedCount })
                  : t('refresh.fetched.none')
                : t('refresh.fetching')
            }
          />
        </Animated.View>
      ) : null}
    </>
  )
}

export default Timeline
