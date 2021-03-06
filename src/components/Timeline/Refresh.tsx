import haptics from '@components/haptics'
import Icon from '@components/Icon'
import {
  QueryKeyTimeline,
  TimelineData,
  useTimelineQuery
} from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { InfiniteData, useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  scrollY: Animated.SharedValue<number>
  fetchingType: Animated.SharedValue<0 | 1 | 2>
  disableRefresh?: boolean
}

const CONTAINER_HEIGHT = StyleConstants.Spacing.M * 2.5
export const SEPARATION_Y_1 = -(
  CONTAINER_HEIGHT / 2 +
  StyleConstants.Font.Size.S / 2
)
export const SEPARATION_Y_2 = -(
  CONTAINER_HEIGHT * 1.5 +
  StyleConstants.Font.Size.S / 2
)

const TimelineRefresh: React.FC<Props> = ({
  queryKey,
  scrollY,
  fetchingType,
  disableRefresh = false
}) => {
  if (disableRefresh) {
    return null
  }

  const fetchingLatestIndex = useRef(0)
  const refetchActive = useRef(false)

  const {
    refetch,
    isFetching,
    isLoading,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingNextPage
  } = useTimelineQuery({
    ...queryKey[1],
    options: {
      getPreviousPageParam: firstPage =>
        firstPage?.links?.prev && {
          min_id: firstPage.links.prev,
          // https://github.com/facebook/react-native/issues/25239#issuecomment-731100372
          limit: '5'
        },
      select: data => {
        if (refetchActive.current) {
          data.pageParams = [data.pageParams[0]]
          data.pages = [data.pages[0]]
          refetchActive.current = false
        }
        return data
      },
      onSuccess: () => {
        if (fetchingLatestIndex.current > 0) {
          if (fetchingLatestIndex.current > 5) {
            clearFirstPage()
            fetchingLatestIndex.current = 0
          } else {
            if (hasPreviousPage) {
              fetchPreviousPage()
              fetchingLatestIndex.current++
            } else {
              clearFirstPage()
              fetchingLatestIndex.current = 0
            }
          }
        }
      }
    }
  })

  const { t } = useTranslation('componentTimeline')
  const { theme } = useTheme()

  const queryClient = useQueryClient()
  const clearFirstPage = () => {
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
  }
  const prepareRefetch = () => {
    refetchActive.current = true
    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(
      queryKey,
      data => {
        if (data) {
          data.pageParams = [undefined]
          const newFirstPage: TimelineData = { body: [] }
          for (let page of data.pages) {
            // @ts-ignore
            newFirstPage.body.push(...page.body)
            if (newFirstPage.body.length > 10) break
          }
          data.pages = [newFirstPage]
        }

        return data
      }
    )
  }

  const [textRight, setTextRight] = useState(0)
  const arrowY = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, SEPARATION_Y_1],
          [
            -CONTAINER_HEIGHT / 2 - StyleConstants.Font.Size.M / 2,
            CONTAINER_HEIGHT / 2 - StyleConstants.Font.Size.S / 2
          ],
          Extrapolate.CLAMP
        )
      }
    ]
  }))
  const arrowTop = useAnimatedStyle(() => ({
    marginTop:
      scrollY.value < SEPARATION_Y_2
        ? withTiming(CONTAINER_HEIGHT)
        : withTiming(0)
  }))

  const arrowStage = useSharedValue(0)
  const onLayout = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.layout.x + nativeEvent.layout.width > textRight) {
        setTextRight(nativeEvent.layout.x + nativeEvent.layout.width)
      }
    },
    [textRight]
  )
  useAnimatedReaction(
    () => {
      if (isFetching) {
        return false
      }
      switch (arrowStage.value) {
        case 0:
          if (scrollY.value < SEPARATION_Y_1) {
            arrowStage.value = 1
            return true
          }
          return false
        case 1:
          if (scrollY.value < SEPARATION_Y_2) {
            arrowStage.value = 2
            return true
          }
          if (scrollY.value > SEPARATION_Y_1) {
            arrowStage.value = 0
            return false
          }
          return false
        case 2:
          if (scrollY.value > SEPARATION_Y_2) {
            arrowStage.value = 1
            return false
          }
          return false
      }
    },
    data => {
      if (data) {
        runOnJS(haptics)('Light')
      }
    },
    [isFetching]
  )
  const wrapperStartLatest = () => {
    fetchingLatestIndex.current = 1
  }

  useAnimatedReaction(
    () => {
      return fetchingType.value
    },
    data => {
      fetchingType.value = 0
      switch (data) {
        case 1:
          runOnJS(wrapperStartLatest)()
          runOnJS(clearFirstPage)()
          runOnJS(fetchPreviousPage)()
          break
        case 2:
          runOnJS(prepareRefetch)()
          runOnJS(refetch)()
          break
      }
    },
    []
  )

  const headerPadding = useAnimatedStyle(
    () => ({
      paddingTop:
        fetchingLatestIndex.current !== 0 ||
        (isFetching && !isLoading && !isFetchingNextPage)
          ? withTiming(StyleConstants.Spacing.M * 2.5)
          : withTiming(0)
    }),
    [fetchingLatestIndex.current, isFetching, isFetchingNextPage, isLoading]
  )

  return (
    <Animated.View style={headerPadding}>
      <View style={styles.base}>
        {isFetching ? (
          <View style={styles.container2}>
            <Circle size={StyleConstants.Font.Size.L} color={theme.secondary} />
          </View>
        ) : (
          <>
            <View style={styles.container1}>
              <Text
                style={[styles.explanation, { color: theme.primary }]}
                onLayout={onLayout}
                children={t('refresh.fetchPreviousPage')}
              />
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    left: textRight + StyleConstants.Spacing.S
                  },
                  arrowY,
                  arrowTop
                ]}
                children={
                  <Icon
                    name='ArrowLeft'
                    size={StyleConstants.Font.Size.M}
                    color={theme.primary}
                  />
                }
              />
            </View>
            <View style={styles.container2}>
              <Text
                style={[styles.explanation, { color: theme.primary }]}
                onLayout={onLayout}
                children={t('refresh.refetch')}
              />
            </View>
          </>
        )}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CONTAINER_HEIGHT * 2,
    alignItems: 'center'
  },
  container1: {
    flex: 1,
    flexDirection: 'row',
    height: CONTAINER_HEIGHT
  },
  container2: { height: CONTAINER_HEIGHT, justifyContent: 'center' },
  explanation: {
    fontSize: StyleConstants.Font.Size.S,
    lineHeight: CONTAINER_HEIGHT
  }
})

export default TimelineRefresh
