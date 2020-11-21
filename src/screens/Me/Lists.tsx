import React from 'react'
import { ActivityIndicator, Text } from 'react-native'
import { useQuery } from 'react-query'
import { MenuContainer, MenuHeader, MenuItem } from 'src/components/Menu'

import { listsFetch } from 'src/utils/fetches/listsFetch'

const ScreenMeLists: React.FC = () => {
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
      lists = data?.map(d => (
        <MenuItem
          icon='list'
          title={d.title}
          navigateTo='Screen-Me-Lists-List'
          navigateToParams={{
            list: d.id
          }}
        />
      ))
      break
  }

  return (
    <MenuContainer>
      <MenuHeader heading='我的列表' />
      {lists}
    </MenuContainer>
  )
}

export default ScreenMeLists
