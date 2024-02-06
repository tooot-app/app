import ComponentAccount from '@components/Account'
import Icon from '@components/Icon'
import { Loading } from '@components/Loading'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyUsers, useUsersQuery } from '@utils/queryHooks/users'
import { flattenPages } from '@utils/queryHooks/utils'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

const TabSharedUsers: React.FC<TabSharedStackScreenProps<'Tab-Shared-Users'>> = ({
  navigation,
  route: { params }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const queryKey: QueryKeyUsers = ['Users', params]
  const { data, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } = useUsersQuery({
    ...queryKey[1]
  })

  return (
    <FlatList
      data={flattenPages(data)}
      style={{
        minHeight: '100%',
        paddingVertical: StyleConstants.Spacing.Global.PagePadding
      }}
      renderItem={({ item }) => (
        <ComponentAccount
          account={item}
          props={{ onPress: () => navigation.push('Tab-Shared-Account', { account: item }) }}
        />
      )}
      onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
      onEndReachedThreshold={0.75}
      ItemSeparatorComponent={ComponentSeparator}
      ListEmptyComponent={
        isFetching ? (
          <View
            style={{
              flex: 1,
              minHeight: '100%',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Loading />
          </View>
        ) : null
      }
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
              borderRadius: StyleConstants.BorderRadius
            }}
          >
            <Icon
              name='alert-circle'
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
