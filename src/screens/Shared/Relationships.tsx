import SegmentedControl from '@react-native-community/segmented-control'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { TabView } from 'react-native-tab-view'
import RelationshipsList from './Relationships/List'

export interface Props {
  route: {
    params: {
      account: Mastodon.Account
      initialType: 'following' | 'followers'
    }
  }
}

const ScreenSharedRelationships: React.FC<Props> = ({
  route: {
    params: { account, initialType }
  }
}) => {
  const { mode } = useTheme()
  const navigation = useNavigation()

  const [segment, setSegment] = useState(initialType === 'following' ? 0 : 1)
  useEffect(() => {
    const updateHeaderRight = () =>
      navigation.setOptions({
        headerCenter: () => (
          <View style={styles.segmentsContainer}>
            <SegmentedControl
              appearance={mode}
              values={['关注中', '关注者']}
              selectedIndex={segment}
              onChange={({ nativeEvent }) =>
                setSegment(nativeEvent.selectedSegmentIndex)
              }
            />
          </View>
        )
      })
    return updateHeaderRight()
  }, [])

  const routes: { key: Props['route']['params']['initialType'] }[] = [
    { key: 'following' },
    { key: 'followers' }
  ]

  const renderScene = ({
    route
  }: {
    route: {
      key: Props['route']['params']['initialType']
    }
  }) => {
    return <RelationshipsList id={account.id} type={route.key} />
  }

  return (
    <TabView
      lazy
      swipeEnabled
      renderScene={renderScene}
      renderTabBar={() => null}
      initialLayout={{ width: Dimensions.get('window').width }}
      navigationState={{ index: segment, routes }}
      onIndexChange={index => setSegment(index)}
    />
  )
}

const styles = StyleSheet.create({
  segmentsContainer: {
    flexBasis: '60%'
  }
})

export default React.memo(ScreenSharedRelationships, () => true)
