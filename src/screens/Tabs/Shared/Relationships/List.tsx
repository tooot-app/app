import ComponentAccount from '@components/Account'
import ComponentSeparator from '@components/Separator'
import { useScrollToTop } from '@react-navigation/native'
import {
  QueryKeyRelationships,
  useRelationshipsQuery
} from '@utils/queryHooks/relationships'
import React, { useCallback, useMemo, useRef } from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

export interface Props {
  id: Mastodon.Account['id']
  type: 'following' | 'followers'
}

const RelationshipsList: React.FC<Props> = ({ id, type }) => {
  const queryKey: QueryKeyRelationships = ['Relationships', { type, id }]
  const {
    data,
    isFetching,
    refetch,
    fetchNextPage,
    isFetchingNextPage
  } = useRelationshipsQuery({
    ...queryKey[1],
    options: {
      getPreviousPageParam: firstPage =>
        firstPage.links?.prev && { since_id: firstPage.links.next },
      getNextPageParam: lastPage =>
        lastPage.links?.next && { max_id: lastPage.links.next }
    }
  })
  const flattenData = data?.pages ? data.pages.flatMap(d => [...d.body]) : []

  const flRef = useRef<FlatList<Mastodon.Account>>(null)

  const keyExtractor = useCallback(({ id }) => id, [])
  const renderItem = useCallback(
    ({ item }) => <ComponentAccount account={item} origin='relationship' />,
    []
  )
  const onEndReached = useCallback(
    () => !isFetchingNextPage && fetchNextPage(),
    [isFetchingNextPage]
  )
  const refreshControl = useMemo(
    () => (
      <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />
    ),
    [isFetching]
  )

  useScrollToTop(flRef)

  return (
    <FlatList
      ref={flRef}
      windowSize={11}
      data={flattenData}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      style={styles.flatList}
      renderItem={renderItem}
      onEndReached={onEndReached}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.75}
      refreshControl={refreshControl}
      ItemSeparatorComponent={ComponentSeparator}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 2
      }}
    />
  )
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

export default RelationshipsList
