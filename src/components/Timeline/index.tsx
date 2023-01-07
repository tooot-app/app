import ComponentSeparator from '@components/Separator'
import TimelineDefault from '@components/Timeline/Default'
import { useScrollToTop } from '@react-navigation/native'
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
import React, { RefObject, useRef } from 'react'
import { FlatList, FlatListProps, Platform, RefreshControl } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
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
  const { colors } = useTheme()

  const { data, refetch, isFetching, isLoading, fetchNextPage, isFetchingNextPage } =
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
  const fetchingActive = useRef<boolean>(false)

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

  const viewabilityConfigCallbackPairs = useRef<
    Pick<FlatListProps<any>, 'viewabilityConfigCallbackPairs'>['viewabilityConfigCallbackPairs']
  >(
    readMarker
      ? [
          {
            viewabilityConfig: {
              minimumViewTime: 300,
              itemVisiblePercentThreshold: 80,
              waitForInteraction: true
            },
            onViewableItemsChanged: ({ viewableItems }) => {
              const marker = readMarker ? getAccountStorage.string(readMarker) : undefined

              const firstItemId = viewableItems.filter(item => item.isViewable)[0]?.item.id
              if (!fetchingActive.current && firstItemId && firstItemId > (marker || '0')) {
                setAccountStorage([{ key: readMarker, value: firstItemId }])
              } else {
                // setAccountStorage([{ key: readMarker, value: '109519141378761752' }])
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
        fetchingActive={fetchingActive}
        scrollY={scrollY}
        fetchingType={fetchingType}
        disableRefresh={disableRefresh}
        readMarker={readMarker}
      />
      <AnimatedFlatList
        ref={customFLRef || flRef}
        scrollEventThrottle={16}
        onScroll={onScroll}
        windowSize={7}
        data={flattenPages(data)}
        {...(customProps?.renderItem
          ? { renderItem: customProps.renderItem }
          : { renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} /> })}
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
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        {...(!isLoading && {
          maintainVisibleContentPosition: {
            minIndexForVisible: 0
          }
        })}
        {...androidRefreshControl}
        {...customProps}
      />
    </>
  )
}

export default Timeline
