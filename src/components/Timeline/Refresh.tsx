import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { QueryKeyTimeline, TimelineData, useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Platform, Text, View } from 'react-native'
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

export interface Props {
  flRef: RefObject<FlatList<any>>
  queryKey: QueryKeyTimeline
  scrollY: Animated.SharedValue<number>
  fetchingType: Animated.SharedValue<0 | 1 | 2>
  disableRefresh?: boolean
}

const CONTAINER_HEIGHT = StyleConstants.Spacing.M * 2.5
export const SEPARATION_Y_1 = -(CONTAINER_HEIGHT / 2 + StyleConstants.Font.Size.S / 2)
export const SEPARATION_Y_2 = -(CONTAINER_HEIGHT * 1.5 + StyleConstants.Font.Size.S / 2)

const TimelineRefresh: React.FC<Props> = ({
  flRef,
  queryKey,
  scrollY,
  fetchingType,
  disableRefresh = false
}) => {
  if (Platform.OS !== 'ios') {
    return null
  }
  if (disableRefresh) {
    return null
  }

  const fetchingLatestIndex = useRef(0)
  const FETCHING_LATEST_MAX = 5
  const refetchActive = useRef(false)

  const { refetch, isFetching, fetchPreviousPage, hasPreviousPage } = useTimelineQuery({
    ...queryKey[1],
    options: {
      getPreviousPageParam: firstPage =>
        firstPage?.links?.prev && {
          ...(firstPage.links.prev.isOffset
            ? { offset: firstPage.links.prev.id }
            : { min_id: firstPage.links.prev.id }),
          // https://github.com/facebook/react-native/issues/25239#issuecomment-731100372
          limit: '3'
        },
      select: data => {
        if (refetchActive.current) {
          data.pageParams = [data.pageParams[0]]
          data.pages = [data.pages[0]]
          refetchActive.current = false
        }
        return data
      },
      onSuccess: async () => {
        if (fetchingLatestIndex.current > 0) {
          if (fetchingLatestIndex.current > FETCHING_LATEST_MAX) {
            clearFirstPage()
            fetchingLatestIndex.current = 0
          } else {
            if (hasPreviousPage) {
              await new Promise(res => setTimeout(res, 100))
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
  const { colors } = useTheme()

  const queryClient = useQueryClient()
  const clearFirstPage = () => {
    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(queryKey, data => {
      if (data?.pages[0] && data.pages[0].body.length === 0) {
        return {
          pages: data.pages.slice(1),
          pageParams: data.pageParams.slice(1)
        }
      } else {
        return data
      }
    })
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
    marginTop: scrollY.value < SEPARATION_Y_2 ? withTiming(CONTAINER_HEIGHT) : withTiming(0)
  }))

  const arrowStage = useSharedValue(0)
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

  const runFetchPrevious = () => {
    fetchingLatestIndex.current = 1
    fetchPreviousPage()
  }

  const prepareRefetch = () => {
    refetchActive.current = true
    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(queryKey, data => {
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
    })
  }
  const callRefetch = async () => {
    await refetch()
    setTimeout(() => flRef.current?.scrollToOffset({ offset: 0 }), 50)
  }

  useAnimatedReaction(
    () => {
      return fetchingType.value
    },
    data => {
      fetchingType.value = 0
      switch (data) {
        case 1:
          runOnJS(runFetchPrevious)()
          return
        case 2:
          runOnJS(prepareRefetch)()
          runOnJS(callRefetch)()
          return
      }
    },
    []
  )

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: CONTAINER_HEIGHT * 2,
        alignItems: 'center'
      }}
    >
      {(fetchingLatestIndex.current || 99) <= FETCHING_LATEST_MAX || refetchActive.current ? (
        <View style={{ height: CONTAINER_HEIGHT, justifyContent: 'center' }}>
          <Circle size={StyleConstants.Font.Size.L} color={colors.secondary} />
        </View>
      ) : (
        <>
          <View style={{ flex: 1, flexDirection: 'row', height: CONTAINER_HEIGHT }}>
            <Text
              style={{
                fontSize: StyleConstants.Font.Size.S,
                lineHeight: CONTAINER_HEIGHT,
                color: colors.primaryDefault
              }}
              onLayout={({ nativeEvent }) => {
                if (nativeEvent.layout.x + nativeEvent.layout.width > textRight) {
                  setTextRight(nativeEvent.layout.x + nativeEvent.layout.width)
                }
              }}
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
                  color={colors.primaryDefault}
                />
              }
            />
          </View>
          <View style={{ height: CONTAINER_HEIGHT, justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: StyleConstants.Font.Size.S,
                lineHeight: CONTAINER_HEIGHT,
                color: colors.primaryDefault
              }}
              onLayout={({ nativeEvent }) => {
                if (nativeEvent.layout.x + nativeEvent.layout.width > textRight) {
                  setTextRight(nativeEvent.layout.x + nativeEvent.layout.width)
                }
              }}
              children={t('refresh.refetch')}
            />
          </View>
        </>
      )}
    </Animated.View>
  )
}

export default TimelineRefresh
