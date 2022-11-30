import { HeaderRight } from '@components/Header'
import { MenuContainer, MenuRow } from '@components/Menu'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useListsQuery } from '@utils/queryHooks/lists'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TabMeLists: React.FC<TabMeStackScreenProps<'Tab-Me-Lists'>> = ({ navigation }) => {
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
      {data?.map((d: Mastodon.List, i: number) => (
        <MenuRow
          key={i}
          iconFront='List'
          iconBack='ChevronRight'
          title={d.title}
          onPress={() => navigation.navigate('Tab-Me-List', d)}
        />
      ))}
    </MenuContainer>
  )
}

export default TabMeLists
