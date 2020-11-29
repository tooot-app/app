import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { MenuContainer, MenuItem } from 'src/components/Menu'

const Settings: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <MenuContainer>
      <MenuItem
        iconFront='settings'
        title={t('headers.me.settings.root')}
        onPress={() => navigation.navigate('Screen-Me-Settings')}
      />
    </MenuContainer>
  )
}

export default Settings
