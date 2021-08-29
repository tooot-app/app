import { MenuContainer, MenuRow } from '@components/Menu'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useListsQuery } from '@utils/queryHooks/lists'
import React from 'react'

const TabMeLists: React.FC<TabMeStackScreenProps<'Tab-Me-Lists'>> = ({
  navigation
}) => {
  const { data } = useListsQuery({})

  return (
    <MenuContainer>
      {data?.map((d: Mastodon.List, i: number) => (
        <MenuRow
          key={i}
          iconFront='List'
          iconBack='ChevronRight'
          title={d.title}
          onPress={() =>
            navigation.navigate('Tab-Me-Lists-List', {
              list: d.id,
              title: d.title
            })
          }
        />
      ))}
    </MenuContainer>
  )
}

export default TabMeLists
