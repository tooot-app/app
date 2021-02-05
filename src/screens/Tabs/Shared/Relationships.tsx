import SegmentedControl from '@react-native-community/segmented-control'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, StyleSheet, View } from 'react-native'
import { TabView } from 'react-native-tab-view'
import RelationshipsList from './Relationships/List'
import { SharedRelationshipsProp } from './sharedScreens'

const TabSharedRelationships = React.memo(
  ({
    route: {
      params: { account, initialType }
    }
  }: SharedRelationshipsProp) => {
    const { t } = useTranslation('sharedRelationships')
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
                values={[
                  t('heading.segments.left'),
                  t('heading.segments.right')
                ]}
                selectedIndex={segment}
                onChange={({ nativeEvent }) =>
                  setSegment(nativeEvent.selectedSegmentIndex)
                }
              />
            </View>
          )
        })
      return updateHeaderRight()
    }, [segment, mode])

    const routes: {
      key: SharedRelationshipsProp['route']['params']['initialType']
    }[] = [{ key: 'following' }, { key: 'followers' }]

    const renderScene = ({
      route
    }: {
      route: {
        key: SharedRelationshipsProp['route']['params']['initialType']
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
        onIndexChange={index => setSegment(index)}
        navigationState={{ index: segment, routes }}
        initialLayout={{ width: Dimensions.get('screen').width }}
      />
    )
  },
  () => true
)

const styles = StyleSheet.create({
  segmentsContainer: {
    flexBasis: '60%'
  }
})

export default TabSharedRelationships
