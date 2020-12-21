import React, { Dispatch, useCallback } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { TabView } from 'react-native-tab-view'

import Timeline from '@components/Timelines/Timeline'
import { AccountAction, AccountState } from '../Account'
import { StyleConstants } from '@root/utils/styles/constants'

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
      style={styles.base}
      renderScene={renderScene}
      renderTabBar={() => null}
      initialLayout={{ width: Dimensions.get('window').width }}
      navigationState={{ index: accountState.segmentedIndex, routes }}
      onIndexChange={index =>
        accountDispatch({ type: 'segmentedIndex', payload: index })
      }
    />
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: StyleConstants.Spacing.Global.PagePadding + 33
  }
})

export default AccountToots
