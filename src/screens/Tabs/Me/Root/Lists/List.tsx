import Timeline from '@components/Timeline'
import { StackScreenProps } from '@react-navigation/stack'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'

const ScreenMeListsList: React.FC<StackScreenProps<
  Nav.TabMeStackParamList,
  'Tab-Me-Lists-List'
>> = ({
  route: {
    params: { list }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'List', list }]

  return <Timeline queryKey={queryKey} />
}

export default ScreenMeListsList
