import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { MenuContainer, MenuRow } from 'src/components/Menu'

const Collections: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const navigation = useNavigation()

  return (
    <MenuContainer>
      <MenuRow
        iconFront='mail'
        title={t('content.collections.conversations')}
        onPress={() => navigation.navigate('Screen-Me-Conversations')}
      />
      <MenuRow
        iconFront='bookmark'
        title={t('content.collections.bookmarks')}
        onPress={() => navigation.navigate('Screen-Me-Bookmarks')}
      />
      <MenuRow
        iconFront='star'
        title={t('content.collections.favourites')}
        onPress={() => navigation.navigate('Screen-Me-Favourites')}
      />
      <MenuRow
        iconFront='list'
        title={t('content.collections.lists')}
        onPress={() => navigation.navigate('Screen-Me-Lists')}
      />
    </MenuContainer>
  )
}

export default Collections
