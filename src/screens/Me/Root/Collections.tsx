import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { MenuContainer, MenuItem } from 'src/components/Menu'

const Collections: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const navigation = useNavigation()

  return (
    <MenuContainer>
      <MenuItem
        iconFront='mail'
        title={t('content.collections.conversations')}
        onPress={() => navigation.navigate('Screen-Me-Conversations')}
      />
      <MenuItem
        iconFront='bookmark'
        title={t('content.collections.bookmarks')}
        onPress={() => navigation.navigate('Screen-Me-Bookmarks')}
      />
      <MenuItem
        iconFront='star'
        title={t('content.collections.favourites')}
        onPress={() => navigation.navigate('Screen-Me-Favourites')}
      />
      <MenuItem
        iconFront='list'
        title={t('content.collections.lists')}
        onPress={() => navigation.navigate('Screen-Me-Lists')}
      />
    </MenuContainer>
  )
}

export default Collections
