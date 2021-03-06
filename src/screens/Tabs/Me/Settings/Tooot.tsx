import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Updates from 'expo-updates'
import * as Linking from 'expo-linking'
import * as StoreReview from 'expo-store-review'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getInstanceActive } from '@utils/slices/instancesSlice'

const SettingsTooot: React.FC = () => {
  const instanceActive = useSelector(getInstanceActive)
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { t } = useTranslation('meSettings')

  const { isLoading, data } = useSearchQuery({
    term: '@tooot@xmflsct.com',
    options: { enabled: instanceActive !== -1 }
  })

  return (
    <MenuContainer>
      <MenuRow
        title={t('content.support.heading')}
        content={
          <Icon
            name='Heart'
            size={StyleConstants.Font.Size.M}
            color={theme.red}
          />
        }
        iconBack='ChevronRight'
        onPress={() => {
          analytics('settings_support_press')
          Linking.openURL('https://www.buymeacoffee.com/xmflsct')
        }}
      />
      {__DEV__ ||
      ['production', 'development'].some(channel =>
        Updates.releaseChannel?.includes(channel)
      ) ? (
        <MenuRow
          title={t('content.review.heading')}
          content={
            <Icon
              name='Star'
              size={StyleConstants.Font.Size.M}
              color='#FF9500'
            />
          }
          iconBack='ChevronRight'
          onPress={() => {
            analytics('settings_review_press')
            StoreReview.isAvailableAsync().then(() =>
              StoreReview.requestReview()
            )
          }}
        />
      ) : null}
      <MenuRow
        title={t('content.contact.heading')}
        loading={isLoading}
        content={
          <Icon
            name='Mail'
            size={StyleConstants.Font.Size.M}
            color={theme.secondary}
          />
        }
        iconBack='ChevronRight'
        onPress={() => {
          const foundAccounts = data?.accounts.filter(
            account =>
              account.acct === 'tooot@xmflsct.com' ||
              account.url === 'https://social.xmflsct.com/@tooot'
          )
          if (foundAccounts?.length === 1) {
            navigation.navigate('Screen-Compose', {
              type: 'conversation',
              accts: [foundAccounts[0].acct]
            })
          } else {
            WebBrowser.openBrowserAsync('https://social.xmflsct.com/@tooot')
          }
        }}
      />
    </MenuContainer>
  )
}

export default SettingsTooot
