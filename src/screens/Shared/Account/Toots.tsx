import React, { useCallback, useContext, useState } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { TabView, SceneMap } from 'react-native-tab-view'

import Timeline from '@components/Timelines/Timeline'
import { AccountContext } from '../Account'
import { StyleConstants } from '@root/utils/styles/constants'

export interface Props {
  id: Mastodon.Account['id']
}

const AccountToots: React.FC<Props> = ({ id }) => {
  const { accountState, accountDispatch } = useContext(AccountContext)

  const [routes] = useState([
    { key: 'Account_Default' },
    { key: 'Account_All' },
    { key: 'Account_Media' }
  ])
  const singleScene = useCallback(
    ({ route }) => (
      <Timeline
        page={route.key}
        account={id}
        disableRefresh
        scrollEnabled={false}
      />
    ),
    []
  )
  const renderScene = SceneMap({
    Account_Default: singleScene,
    Account_All: singleScene,
    Account_Media: singleScene
  })

  return (
    <TabView
      style={styles.base}
      navigationState={{ index: accountState.segmentedIndex, routes }}
      renderScene={renderScene}
      renderTabBar={() => null}
      onIndexChange={index =>
        accountDispatch({ type: 'segmentedIndex', payload: index })
      }
      initialLayout={{ width: Dimensions.get('window').width }}
      lazy
      swipeEnabled
    />
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: StyleConstants.Spacing.Global.PagePadding + 33
  }
})

export default AccountToots
