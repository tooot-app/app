import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Settings: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation<any>()

  return (
    <MenuContainer>
      <MenuRow
        iconFront='settings'
        iconBack='chevron-right'
        title={t('me.stacks.settings.name')}
        onPress={() => navigation.navigate('Tab-Me-Settings')}
      />
    </MenuContainer>
  )
}

export default Settings
