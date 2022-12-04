import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Linking from 'expo-linking'
import * as StoreReview from 'expo-store-review'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getInstanceActive, getInstanceVersion } from '@utils/slices/instancesSlice'
import { isDevelopment, isRelease } from '@utils/checkEnvironment'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { getExpoToken } from '@utils/slices/appSlice'
import browserPackage from '@helpers/browserPackage'

const SettingsTooot: React.FC = () => {
  const instanceActive = useSelector(getInstanceActive)
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const instanceVersion = useSelector(getInstanceVersion, () => true)
  const expoToken = useSelector(getExpoToken)

  return (
    <MenuContainer>
      <MenuRow
        title={t('me.settings.feedback.heading')}
        content={
          <Icon name='MessageSquare' size={StyleConstants.Font.Size.M} color={colors.secondary} />
        }
        iconBack='ChevronRight'
        onPress={() => Linking.openURL('https://feedback.tooot.app/feature-requests')}
      />
      <MenuRow
        title={t('me.settings.support.heading')}
        content={<Icon name='Heart' size={StyleConstants.Font.Size.M} color={colors.red} />}
        iconBack='ChevronRight'
        onPress={() => Linking.openURL('https://www.buymeacoffee.com/xmflsct')}
      />
      {isDevelopment || isRelease ? (
        <MenuRow
          title={t('me.settings.review.heading')}
          content={<Icon name='Star' size={StyleConstants.Font.Size.M} color='#FF9500' />}
          iconBack='ChevronRight'
          onPress={() => StoreReview?.isAvailableAsync().then(() => StoreReview?.requestReview())}
        />
      ) : null}
      <MenuRow
        title={t('me.settings.contact.heading')}
        content={<Icon name='Mail' size={StyleConstants.Font.Size.M} color={colors.secondary} />}
        iconBack='ChevronRight'
        onPress={async () => {
          if (instanceActive !== -1) {
            navigation.navigate('Screen-Compose', {
              type: 'conversation',
              accts: ['tooot@xmflsct.com'],
              text:
                '[' +
                `${Platform.OS}/${Platform.Version}` +
                ' - ' +
                (Constants.expoConfig?.version ? `t/${Constants.expoConfig?.version}` : '') +
                ' - ' +
                (instanceVersion ? `m/${instanceVersion}` : '') +
                ' - ' +
                (expoToken
                  ? `e/${expoToken.replace(/^ExponentPushToken\[/, '').replace(/\]$/, '')}`
                  : '') +
                ']'
            })
          } else {
            WebBrowser.openBrowserAsync('https://social.xmflsct.com/@tooot', {
              browserPackage: await browserPackage()
            })
          }
        }}
      />
    </MenuContainer>
  )
}

export default SettingsTooot
