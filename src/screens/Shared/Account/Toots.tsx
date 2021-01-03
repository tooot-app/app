import Timeline from '@components/Timelines/Timeline'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StyleConstants } from '@utils/styles/constants'
import React, { useContext } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TabView } from 'react-native-tab-view'
import AccountContext from './utils/createContext'

export interface Props {
  id: Mastodon.Account['id']
}

const AccountToots: React.FC<Props> = ({ id }) => {
  const { accountState, accountDispatch } = useContext(AccountContext)
  const headerHeight = useSafeAreaInsets().top + 44
  const footerHeight = useSafeAreaInsets().bottom + useBottomTabBarHeight()

  const routes: { key: App.Pages }[] = [
    { key: 'Account_Default' },
    { key: 'Account_All' },
    { key: 'Account_Media' }
  ]

  const renderScene = ({
    route
  }: {
    route: {
      key: App.Pages
    }
  }) => {
    return <Timeline page={route.key} account={id} disableRefresh />
  }

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
