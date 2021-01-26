import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useSearchQuery } from '@utils/queryHooks/search'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Linking from 'expo-linking'
import * as StoreReview from 'expo-store-review'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const SettingsTooot: React.FC = () => {
  const localActiveIndex = useSelector(getLocalActiveIndex)
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { t } = useTranslation('meSettings')

  const { isLoading, data } = useSearchQuery({
    term: '@tooot@xmflsct.com',
    options: { enabled: localActiveIndex !== null }
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
          Linking.openURL('https://www.patreon.com/xmflsct')
        }}
      />
      <MenuRow
        title={t('content.review.heading')}
        content={
          <Icon name='Star' size={StyleConstants.Font.Size.M} color='#FF9500' />
        }
        iconBack='ChevronRight'
        onPress={() => {
          analytics('settings_review_press')
          StoreReview.isAvailableAsync().then(() => StoreReview.requestReview())
        }}
      />
      <MenuRow
        title={'联系 tooot'}
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
            account => account.acct === 'tooot@xmflsct.com'
          )
          if (foundAccounts?.length === 1) {
            navigation.navigate('Screen-Shared-Compose', {
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
