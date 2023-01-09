import Timeline from '@components/Timeline'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabMeStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect } from 'react'

const TabMeBookmarks: React.FC<NativeStackScreenProps<TabMeStackParamList, 'Tab-Me-Bookmarks'>> = ({
  navigation
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Bookmarks' }]
  useEffect(() => {
    navigation.setParams({ queryKey: queryKey })
  }, [])

  return <Timeline queryKey={queryKey} />
}

export default TabMeBookmarks
