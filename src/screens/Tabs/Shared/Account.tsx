import analytics from '@components/analytics'
import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { useAccountQuery } from '@utils/queryHooks/account'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import AccountAttachments from './Account/Attachments'
import AccountHeader from './Account/Header'
import AccountInformation from './Account/Information'
import AccountNav from './Account/Nav'
import AccountContext from './Account/utils/createContext'
import accountInitialState from './Account/utils/initialState'
import accountReducer from './Account/utils/reducer'
import { SharedAccountProp } from './sharedScreens'

const TabSharedAccount: React.FC<SharedAccountProp> = ({
  route: {
    params: { account }
  },
  navigation
}) => {
  const { theme } = useTheme()

  const { data } = useAccountQuery({ id: account.id })

  const scrollY = useSharedValue(0)
  const [accountState, accountDispatch] = useReducer(
    accountReducer,
    accountInitialState
  )

  useEffect(() => {
    const updateHeaderRight = () =>
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            content='MoreHorizontal'
            onPress={() => {
              analytics('bottomsheet_open_press', {
                page: 'account'
              })
              // @ts-ignore
              navigation.navigate('Screen-Actions', {
                type: 'account',
                account
              })
            }}
            background
          />
        )
      })
    return updateHeaderRight()
  }, [])

  const onScroll = useCallback(({ nativeEvent }) => {
    scrollY.value = nativeEvent.contentOffset.y
  }, [])

  const ListHeaderComponent = useMemo(() => {
    return (
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <AccountHeader account={data} />
        <AccountInformation account={data} />
        <AccountAttachments account={data} />
      </View>
    )
  }, [data])

  const queryKey: QueryKeyTimeline = [
    'Timeline',
    { page: 'Account_Default', account: account.id }
  ]
  const renderItem = useCallback(
    ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
    []
  )

  return (
    <AccountContext.Provider value={{ accountState, accountDispatch }}>
      <AccountNav scrollY={scrollY} account={data} />

      <Timeline
        queryKey={queryKey}
        disableRefresh
        customProps={{
          renderItem,
          onScroll,
          ListHeaderComponent
        }}
      />
    </AccountContext.Provider>
  )
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1
  }
})

export default TabSharedAccount
