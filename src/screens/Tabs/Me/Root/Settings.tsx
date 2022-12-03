import { MenuContainer, MenuRow } from '@components/Menu'
import browserPackage from '@helpers/browserPackage'
import { useNavigation } from '@react-navigation/native'
import { getInstanceActive, getInstanceUrl } from '@utils/slices/instancesSlice'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const Settings: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation<any>()
  const instanceActive = useSelector(getInstanceActive)
  const url = useSelector(getInstanceUrl)

  return (
    <MenuContainer>
      <MenuRow
        iconFront='Settings'
        iconBack='ChevronRight'
        title={t('me.stacks.settings.name')}
        onPress={() => navigation.navigate('Tab-Me-Settings')}
      />
      {instanceActive !== -1 ? (
        <MenuRow
          iconFront='Sliders'
          iconBack='ExternalLink'
          title={t('me.stacks.webSettings.name')}
          onPress={async () =>
            WebBrowser.openAuthSessionAsync(
              `https://${url}/settings/preferences`,
              'tooot://tooot',
              {
                browserPackage: await browserPackage(),
                dismissButtonStyle: 'done',
                readerMode: false
              }
            )
          }
        />
      ) : null}
    </MenuContainer>
  )
}

export default Settings
