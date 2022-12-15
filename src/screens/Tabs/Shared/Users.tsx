import ComponentAccount from '@components/Account'
import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyUsers, useUsersQuery } from '@utils/queryHooks/users'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

const TabSharedUsers: React.FC<TabSharedStackScreenProps<'Tab-Shared-Users'>> = ({
  navigation,
  route: { params }
}) => {
  const { colors } = useTheme()
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
        firstPage.links?.prev?.id && { min_id: firstPage.links.prev.id },
      getNextPageParam: lastPage => lastPage.links?.next?.id && { max_id: lastPage.links.next.id }
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
      ListHeaderComponent={
        data?.pages[0]?.warnIncomplete === true ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
              padding: StyleConstants.Spacing.S,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: StyleConstants.Spacing.S
            }}
          >
            <Icon
              name='AlertCircle'
              color={colors.secondary}
              size={StyleConstants.Font.Size.M}
              style={{ marginRight: StyleConstants.Spacing.S }}
            />
            <CustomText fontStyle='S' style={{ flexShrink: 1, color: colors.secondary }}>
              {t('shared.users.resultIncomplete')}
            </CustomText>
          </View>
        ) : null
      }
    />
  )
}

export default TabSharedUsers
