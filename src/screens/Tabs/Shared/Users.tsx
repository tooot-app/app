import ComponentAccount from '@components/Account'
import { HeaderLeft } from '@components/Header'
import ComponentSeparator from '@components/Separator'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyUsers, useUsersQuery } from '@utils/queryHooks/users'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'

const TabSharedUsers: React.FC<TabSharedStackScreenProps<'Tab-Shared-Users'>> = ({
  navigation,
  route: { params }
}) => {
  const { t } = useTranslation('screenTabs')
  useEffect(() => {
    navigation.setOptions({
      title: t(`shared.users.${params.reference}.${params.type}`, { count: params.count }),
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
    })
  }, [])

  const queryKey: QueryKeyUsers = ['Users', params]
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useUsersQuery({
    ...queryKey[1],
    options: {
      getPreviousPageParam: firstPage =>
        firstPage.links?.prev && { since_id: firstPage.links.next },
      getNextPageParam: lastPage => lastPage.links?.next && { max_id: lastPage.links.next }
    }
  })
  const flattenData = data?.pages ? data.pages.flatMap(page => [...page.body]) : []

  const onEndReached = useCallback(
    () => hasNextPage && !isFetchingNextPage && fetchNextPage(),
    [hasNextPage, isFetchingNextPage]
  )

  return (
    <FlatList
      windowSize={7}
      data={flattenData}
      style={{
        minHeight: '100%'
      }}
      renderItem={({ item }) => <ComponentAccount account={item} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.75}
      ItemSeparatorComponent={ComponentSeparator}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 2
      }}
    />
  )
}

export default TabSharedUsers
