import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { useNavigation } from '@react-navigation/native'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect, useRef, useState } from 'react'
import { FlatList } from 'react-native'
import { InfiniteQueryObserver, useQueryClient } from 'react-query'

const TabSharedToot: React.FC<TabSharedStackScreenProps<'Tab-Shared-Toot'>> = ({
  route: {
    params: { toot, rootQueryKey }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Toot', toot: toot.id }]

  const flRef = useRef<FlatList>(null)

  const [itemsLength, setItemsLength] = useState(0)
  const scrolled = useRef(false)
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const observer = new InfiniteQueryObserver(queryClient, {
    queryKey,
    enabled: false
  })
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
        setItemsLength(flattenData.length)
        if (!scrolled.current) {
          scrolled.current = true
          const pointer = flattenData.findIndex(({ id }) => id === toot.id)
          if (pointer < 1) return
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
  }, [scrolled.current])

  return (
    <Timeline
      flRef={flRef}
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => (
          <TimelineDefault
            item={item}
            queryKey={queryKey}
            rootQueryKey={rootQueryKey}
            highlighted={toot.id === item.id}
          />
        ),
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
