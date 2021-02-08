import Timeline from '@components/Timeline'
import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'

const ScreenMeListsList: React.FC<StackScreenProps<
  Nav.TabMeStackParamList,
  'Tab-Me-Lists-List'
>> = ({
  route: {
    params: { list }
  }
}) => {
  return <Timeline page='List' list={list} />
}

export default ScreenMeListsList
