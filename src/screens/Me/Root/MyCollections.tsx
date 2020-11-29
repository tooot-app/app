import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { MenuContainer, MenuItem } from 'src/components/Menu'

const MyInfo: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <MenuContainer>
      <MenuItem
        iconFront='mail'
        title={t('headers.me.conversations')}
        onPress={() => navigation.navigate('Screen-Me-Conversations')}
      />
      <MenuItem
        iconFront='bookmark'
        title={t('headers.me.bookmarks')}
        onPress={() => navigation.navigate('Screen-Me-Bookmarks')}
      />
      <MenuItem
        iconFront='star'
        title={t('headers.me.favourites')}
        onPress={() => navigation.navigate('Screen-Me-Favourites')}
      />
      <MenuItem
        iconFront='list'
        title={t('headers.me.lists.root')}
        onPress={() => navigation.navigate('Screen-Me-Lists')}
      />
    </MenuContainer>
  )
}

export default MyInfo
