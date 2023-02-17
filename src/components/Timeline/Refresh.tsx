import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { PagedResponse } from '@utils/api/helpers'
import {
  queryFunctionTimeline,
  QueryKeyTimeline,
  useTimelineQuery
} from '@utils/queryHooks/timeline'
import { setAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Platform, Text, View } from 'react-native'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

export interface Props {
  flRef: RefObject<FlatList<any>>
  queryKey: QueryKeyTimeline
  isFetchingPrev: SharedValue<boolean>
  setFetchedCount: React.Dispatch<React.SetStateAction<number | null>>
  scrollY: SharedValue<number>
  fetchingType: SharedValue<0 | 1 | 2>
  disableRefresh?: boolean
  readMarker?: 'read_marker_following'
}

const CONTAINER_HEIGHT = StyleConstants.Spacing.M * 2.5
export const SEPARATION_Y_1 = -(CONTAINER_HEIGHT / 2 + StyleConstants.Font.Size.S / 2)
export const SEPARATION_Y_2 = -(CONTAINER_HEIGHT * 1.5 + StyleConstants.Font.Size.S / 2)

const TimelineRefresh: React.FC<Props> = ({
  flRef,
  queryKey,
  isFetchingPrev,
  setFetchedCount,
  scrollY,
  fetchingType,
  disableRefresh = false,
  readMarker
}) => {
  if (Platform.OS !== 'ios') {
    return null
  }
  if (disableRefresh) {
    return null
  }

  const PREV_PER_BATCH = 1
  const prevCache = useRef<(Mastodon.Status | Mastodon.Notification | Mastodon.Conversation)[]>()
  const prevStatusId = useRef<Mastodon.Status['id']>()

  const queryClient = useQueryClient()
  const { refetch, isFetched } = useTimelineQuery({ ...queryKey[1] })

  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

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
      if (isFetchingPrev.value) {
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
      if (data && isFetched) {
        runOnJS(haptics)('Light')
      }
    },
    [isFetched]
  )

  const fetchAndScrolled = useSharedValue(false)
  const runFetchPrevious = async () => {
    if (isFetchingPrev.value) return

    const firstPage =
      queryClient.getQueryData<
        InfiniteData<
          PagedResponse<(Mastodon.Status | Mastodon.Notification | Mastodon.Conversation)[]>
        >
      >(queryKey)?.pages[0]

    isFetchingPrev.value = true
    prevStatusId.current = firstPage?.body[0]?.id

    await queryFunctionTimeline({
      queryKey,
      pageParam: firstPage?.links?.prev,
      meta: {}
    })
      .then(async res => {
        setFetchedCount(res.body.length)

        if (!res.body.length) return

        queryClient.setQueryData<
          InfiniteData<
            PagedResponse<(Mastodon.Status | Mastodon.Notification | Mastodon.Conversation)[]>
          >
        >(queryKey, old => {
          if (!old) return old

          let count = 0
          const keepPagesCount = Math.max(
            1,
            old.pages.findIndex(page => {
              count = count + page.body.length
              return count >= 20
            })
          )

          prevCache.current = res.body.slice(0, -PREV_PER_BATCH)
          return {
            ...old,
            pages: [
              { ...res, body: res.body.slice(-PREV_PER_BATCH) },
              ...old.pages.slice(0, keepPagesCount)
            ]
          }
        })

        return res.body.length - PREV_PER_BATCH
      })
      .then(async nextLength => {
        if (!nextLength) {
          isFetchingPrev.value = false
          return
        }

        for (let [index] of Array(Math.ceil(nextLength / PREV_PER_BATCH)).entries()) {
          if (!fetchAndScrolled.value && index < 3 && scrollY.value > 15) {
            fetchAndScrolled.value = true
            flRef.current?.scrollToOffset({ offset: scrollY.value - 15, animated: true })
          }

          await new Promise<void>(promise => setTimeout(promise, 16))
          queryClient.setQueryData<
            InfiniteData<
              PagedResponse<(Mastodon.Status | Mastodon.Notification | Mastodon.Conversation)[]>
            >
          >(queryKey, old => {
            if (!old) return old

            return {
              ...old,
              pages: old.pages.map((page, index) => {
                if (index === 0) {
                  const insert = prevCache.current?.slice(-PREV_PER_BATCH)
                  prevCache.current = prevCache.current?.slice(0, -PREV_PER_BATCH)
                  if (insert) {
                    page.body.unshift(...insert)
                    return page
                  } else {
                    return page
                  }
                } else {
                  return page
                }
              })
            }
          })
        }
        isFetchingPrev.value = false
      })
  }

  const runFetchLatest = async () => {
    queryClient.invalidateQueries(queryKey)
    if (readMarker) {
      setAccountStorage([{ key: readMarker, value: undefined }])
    }
    queryClient.setQueryData<
      InfiniteData<
        PagedResponse<(Mastodon.Status | Mastodon.Notification | Mastodon.Conversation)[]>
      >
    >(queryKey, old => {
      if (!old) return old

      return {
        pages: [old.pages[0]],
        pageParams: [old.pageParams[0]]
      }
    })
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
          runOnJS(runFetchLatest)()
          return
      }
    },
    []
  )

  if (!isFetched) return null

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
              name='arrow-left'
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
    </Animated.View>
  )
}

export default TimelineRefresh
