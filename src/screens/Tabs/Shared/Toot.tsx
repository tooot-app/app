import { HeaderLeft } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { InfiniteQueryObserver, useQueryClient } from '@tanstack/react-query'

const TabSharedToot: React.FC<TabSharedStackScreenProps<'Tab-Shared-Toot'>> = ({
  navigation,
  route: {
    params: { toot, rootQueryKey }
  }
}) => {
  const { t } = useTranslation('screenTabs')

  useEffect(() => {
    navigation.setOptions({
      title: t('shared.toot.name'),
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
    })
  }, [])

  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Toot', toot: toot.id }]

  const flRef = useRef<FlatList>(null)

  const [itemsLength, setItemsLength] = useState(0)
  const scrolled = useRef(false)
  const queryClient = useQueryClient()
  const observer = new InfiniteQueryObserver(queryClient, {
    queryKey,
    enabled: false
  })

  const replyLevels = useRef<{ id: string; level: number }[]>([])
  const data = useRef<Mastodon.Status[]>()
  const highlightIndex = useRef<number>(0)
  useEffect(() => {
    return observer.subscribe(result => {
      if (result.isSuccess) {
        const flattenData = result.data?.pages
          ? // @ts-ignore
            result.data.pages.flatMap(d => [...d.body])
          : []
        // Auto go back when toot page is empty
        if (flattenData.length < 1) {
          navigation.goBack()
          return
        }
        data.current = flattenData
        highlightIndex.current = flattenData.findIndex(({ id }) => id === toot.id)

        for (const [index, status] of flattenData.entries()) {
          if (status.id === toot.id) continue
          if (status.in_reply_to_id === toot.id) continue

          if (!replyLevels.current.find(reply => reply.id === status.in_reply_to_id)) {
            const prevLevel =
              replyLevels.current.find(reply => reply.id === flattenData[index - 1].in_reply_to_id)
                ?.level || 0
            replyLevels.current.push({
              id: status.in_reply_to_id,
              level: prevLevel + 1
            })
          }
        }

        setItemsLength(flattenData.length)
        if (!scrolled.current) {
          scrolled.current = true
          const pointer = flattenData.findIndex(({ id }) => id === toot.id)
          if (pointer < 1) return
          const length = flRef.current?.props.data?.length
          if (!length) return
          try {
            setTimeout(() => {
              try {
                flRef.current?.scrollToIndex({
                  index: pointer,
                  viewOffset: 100
                })
              } catch {}
            }, 500)
          } catch (error) {
            return
          }
        }
      }
    })
  }, [scrolled.current, replyLevels.current])

  return (
    <Timeline
      flRef={flRef}
      queryKey={queryKey}
      queryOptions={{ staleTime: 0, refetchOnMount: true }}
      customProps={{
        renderItem: ({ item }) => {
          return (
            <TimelineDefault
              item={item}
              queryKey={queryKey}
              rootQueryKey={rootQueryKey}
              highlighted={toot.id === item.id}
            />
          )
        },
        // renderItem: ({ item, index }) => {
        //   const levels = {
        //     previous:
        //       replyLevels.current.find(
        //         reply => reply.id === data.current?.[index - 1]?.in_reply_to_id
        //       )?.level || 0,
        //     current:
        //       replyLevels.current.find(reply => reply.id === item.in_reply_to_id)?.level || 0,
        //     next:
        //       replyLevels.current.find(
        //         reply => reply.id === data.current?.[index + 1]?.in_reply_to_id
        //       )?.level || 0
        //   }

        //   return (
        //     <>
        //       <TimelineDefault
        //         item={item}
        //         queryKey={queryKey}
        //         rootQueryKey={rootQueryKey}
        //         highlighted={toot.id === item.id}
        //         isConversation={toot.id !== item.id}
        //       />
        //       {Array.from(Array(levels.current)).map((_, i) => {
        //         if (index < highlightIndex.current) return null
        //         if (
        //           levels.previous + 1 === levels.current ||
        //           (levels.previous && levels.current && levels.previous === levels.current)
        //         ) {
        //           return (
        //             <View
        //               key={i}
        //               style={{
        //                 position: 'absolute',
        //                 top: 0,
        //                 left: StyleConstants.Spacing.Global.PagePadding / 2 + 8 * i,
        //                 height:
        //                   levels.current === levels.next
        //                     ? StyleConstants.Spacing.Global.PagePadding
        //                     : StyleConstants.Spacing.Global.PagePadding + StyleConstants.Avatar.XS,
        //                 borderLeftColor: colors.border,
        //                 borderLeftWidth: 1
        //               }}
        //             />
        //           )
        //         } else {
        //           return null
        //         }
        //       })}
        //       {Array.from(Array(levels.next)).map((_, i) => {
        //         if (index < highlightIndex.current) return null
        //         if (
        //           levels.current + 1 === levels.next ||
        //           (levels.current && levels.next && levels.current === levels.next)
        //         ) {
        //           return (
        //             <View
        //               key={i}
        //               style={{
        //                 position: 'absolute',
        //                 top:
        //                   levels.current + 1 === levels.next && levels.next > i + 1
        //                     ? StyleConstants.Spacing.Global.PagePadding + StyleConstants.Avatar.XS
        //                     : StyleConstants.Spacing.Global.PagePadding,
        //                 left: StyleConstants.Spacing.Global.PagePadding / 2 + 8 * i,
        //                 height: 200,
        //                 borderLeftColor: colors.border,
        //                 borderLeftWidth: 1
        //               }}
        //             />
        //           )
        //         } else {
        //           return null
        //         }
        //       })}
        //     </>
        //   )
        // },
        onScrollToIndexFailed: error => {
          const offset = error.averageItemLength * error.index
          flRef.current?.scrollToOffset({ offset })
          try {
            error.index < itemsLength &&
              setTimeout(
                () =>
                  flRef.current?.scrollToIndex({
                    index: error.index,
                    viewOffset: 100
                  }),
                500
              )
          } catch {}
        }
      }}
      disableRefresh
      disableInfinity
    />
  )
}

export default TabSharedToot
