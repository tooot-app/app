import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { ActivityIndicator, Text } from 'react-native'
import { useQuery } from 'react-query'
import { MenuContainer, MenuItem } from 'src/components/Menu'

import { listsFetch } from 'src/utils/fetches/listsFetch'

const ScreenMeLists: React.FC = () => {
  const navigation = useNavigation()
  const { status, data } = useQuery(['Lists'], listsFetch)

  let lists
  switch (status) {
    case 'loading':
      lists = <ActivityIndicator />
      break
    case 'error':
      lists = <Text>载入错误</Text>
      break
    case 'success':
      lists = data?.map((d: Mastodon.List, i: number) => (
        <MenuItem
          key={i}
          iconFront='list'
          title={d.title}
          onPress={() =>
            navigation.navigate('Screen-Me-Lists-List', {
              list: d.id,
              title: d.title
            })
          }
        />
      ))
      break
  }

  return <MenuContainer>{lists}</MenuContainer>
}

export default ScreenMeLists
