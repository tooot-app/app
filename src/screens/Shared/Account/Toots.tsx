import React, { Dispatch, useCallback } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { TabView } from 'react-native-tab-view'

import Timeline from '@components/Timelines/Timeline'
import { AccountAction, AccountState } from '../Account'
import { StyleConstants } from '@root/utils/styles/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

export interface Props {
  accountState: AccountState
  accountDispatch: Dispatch<AccountAction>
  id: Mastodon.Account['id']
}

const AccountToots: React.FC<Props> = ({
  accountState,
  accountDispatch,
  id
}) => {
  const headerHeight = useSafeAreaInsets().top + 44
  const footerHeight = useSafeAreaInsets().bottom + useBottomTabBarHeight()

  const routes: { key: App.Pages }[] = [
    { key: 'Account_Default' },
    { key: 'Account_All' },
    { key: 'Account_Media' }
  ]

  const renderScene = useCallback(
    ({
      route
    }: {
      route: {
        key: App.Pages
      }
    }) => {
      return <Timeline page={route.key} account={id} disableRefresh />
    },
    []
  )

  return (
    <TabView
      lazy
      swipeEnabled
      renderScene={renderScene}
      renderTabBar={() => null}
      initialLayout={{ width: Dimensions.get('window').width }}
      navigationState={{ index: accountState.segmentedIndex, routes }}
      onIndexChange={index =>
        accountDispatch({ type: 'segmentedIndex', payload: index })
      }
      style={[
        styles.base,
        {
          height:
            Dimensions.get('window').height -
            headerHeight -
            footerHeight -
            (33 + StyleConstants.Spacing.Global.PagePadding * 2)
        }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: StyleConstants.Spacing.Global.PagePadding + 33
  }
})

export default React.memo(AccountToots, () => true)
