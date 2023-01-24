import { HeaderRight } from '@components/Header'
import { MenuContainer, MenuRow } from '@components/Menu'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useListsQuery } from '@utils/queryHooks/lists'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TabMeListList: React.FC<TabMeStackScreenProps<'Tab-Me-List-List'>> = ({ navigation }) => {
  const { data } = useListsQuery({})
  const { t } = useTranslation()

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          type='text'
          content={t('buttons.create')}
          onPress={() => navigation.navigate('Tab-Me-List-Edit', { type: 'add' })}
        />
      )
    })
  }, [])

  return (
    <MenuContainer>
      {data?.map((list, index) => (
        <MenuRow
          key={index}
          iconFront='list'
          iconBack='chevron-right'
          title={list.title}
          onPress={() => navigation.navigate('Tab-Me-List', { list })}
        />
      ))}
    </MenuContainer>
  )
}

export default TabMeListList
