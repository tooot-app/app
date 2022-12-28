import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import browserPackage from '@helpers/browserPackage'
import { useNavigation } from '@react-navigation/native'
import { getAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

const SettingsTooot: React.FC = () => {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const [accountActive] = useGlobalStorage.string('account.active')
  const [expoToken] = useGlobalStorage.string('app.expo_token')

  return (
    <MenuContainer>
      <MenuRow
        title={t('me.settings.support.heading')}
        content={<Icon name='Heart' size={StyleConstants.Font.Size.M} color={colors.red} />}
        iconBack='ChevronRight'
        onPress={() => Linking.openURL('https://www.buymeacoffee.com/xmflsct')}
      />
      <MenuRow
        title={t('me.settings.feedback.heading')}
        content={
          <Icon name='MessageSquare' size={StyleConstants.Font.Size.M} color={colors.secondary} />
        }
        iconBack='ChevronRight'
        onPress={() => Linking.openURL('https://feedback.tooot.app/feature-requests')}
      />
      <MenuRow
        title={t('me.settings.contact.heading')}
        content={<Icon name='Mail' size={StyleConstants.Font.Size.M} color={colors.secondary} />}
        iconBack='ChevronRight'
        onPress={async () => {
          if (accountActive) {
            navigation.navigate('Screen-Compose', {
              type: 'conversation',
              accts: ['tooot@xmflsct.com'],
              visibility: 'direct',
              text:
                '[' +
                `${Platform.OS}/${Platform.Version}` +
                ' - ' +
                (Constants.expoConfig?.version ? `t/${Constants.expoConfig?.version}` : '') +
                ' - ' +
                `m/${getAccountStorage.string('version')}` +
                ' - ' +
                (expoToken.length
                  ? `e/${expoToken.replace(/^ExponentPushToken\[/, '').replace(/\]$/, '')}`
                  : '') +
                ']'
            })
          } else {
            WebBrowser.openBrowserAsync('https://social.xmflsct.com/@tooot', {
              ...(await browserPackage())
            })
          }
        }}
      />
    </MenuContainer>
  )
}

export default SettingsTooot
