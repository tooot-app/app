import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { getLocalUrl } from '@utils/slices/instancesSlice'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const Settings: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const navigation = useNavigation()

  const localUrl = useSelector(getLocalUrl)

  return (
    <MenuContainer>
      {/* <MenuRow
        iconFront='User'
        iconBack='ExternalLink'
        title={t('content.accountSettings')}
        onPress={() =>
          localUrl &&
          WebBrowser.openBrowserAsync(`https://${localUrl}/settings/profile`)
        }
      /> */}
      <MenuRow
        iconFront='Settings'
        iconBack='ChevronRight'
        title={t('content.appSettings')}
        onPress={() => navigation.navigate('Tab-Me-Settings')}
      />
    </MenuContainer>
  )
}

export default Settings
