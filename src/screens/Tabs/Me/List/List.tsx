import { HeaderRight } from '@components/Header'
import { MenuContainer, MenuRow } from '@components/Menu'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useListsQuery } from '@utils/queryHooks/lists'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TabMeListList: React.FC<TabMeStackScreenProps<'Tab-Me-List-List'>> = ({ navigation }) => {
  const { data } = useListsQuery({})
  const { t } = useTranslation('screenTabs')

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t('me.stacks.listAdd.name')}
          content='Plus'
          onPress={() => navigation.navigate('Tab-Me-List-Edit', { type: 'add' })}
        />
      )
    })
  }, [])

  return (
    <MenuContainer>
      {data?.map((params, index) => (
        <MenuRow
          key={index}
          iconFront='List'
          iconBack='ChevronRight'
          title={params.title}
          onPress={() => navigation.navigate('Tab-Me-List', params)}
        />
      ))}
    </MenuContainer>
  )
}

export default TabMeListList
