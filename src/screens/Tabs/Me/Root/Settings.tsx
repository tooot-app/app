import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import browserPackage from '@utils/helpers/browserPackage'
import { getAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Settings: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation<any>()

  const [accountActive] = useGlobalStorage.string('account.active')

  return (
    <MenuContainer>
      <MenuRow
        iconFront='Settings'
        iconBack='ChevronRight'
        title={t('me.stacks.settings.name')}
        onPress={() => navigation.navigate('Tab-Me-Settings')}
      />
      {accountActive ? (
        <MenuRow
          iconFront='Sliders'
          iconBack='ExternalLink'
          title={t('me.stacks.webSettings.name')}
          onPress={async () =>
            WebBrowser.openAuthSessionAsync(
              `https://${getAccountStorage.string('auth.domain')}/settings/preferences`,
              'tooot://tooot',
              {
                ...(await browserPackage()),
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
