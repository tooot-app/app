import analytics from '@components/analytics'
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
import { getInstanceActive } from '@utils/slices/instancesSlice'
import { isDevelopment, isRelease } from '@utils/checkEnvironment'

const SettingsTooot: React.FC = () => {
  const instanceActive = useSelector(getInstanceActive)
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  return (
    <MenuContainer>
      <MenuRow
        title={t('me.settings.feedback.heading')}
        content={
          <Icon
            name='MessageSquare'
            size={StyleConstants.Font.Size.M}
            color={colors.secondary}
          />
        }
        iconBack='ChevronRight'
        onPress={() => {
          analytics('settings_feedback_press')
          Linking.openURL('https://feedback.tooot.app/feature-requests')
        }}
      />
      <MenuRow
        title={t('me.settings.support.heading')}
        content={
          <Icon
            name='Heart'
            size={StyleConstants.Font.Size.M}
            color={colors.red}
          />
        }
        iconBack='ChevronRight'
        onPress={() => {
          analytics('settings_support_press')
          Linking.openURL('https://www.buymeacoffee.com/xmflsct')
        }}
      />
      {isDevelopment || isRelease ? (
        <MenuRow
          title={t('me.settings.review.heading')}
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
            StoreReview?.isAvailableAsync().then(() =>
              StoreReview?.requestReview()
            )
          }}
        />
      ) : null}
      <MenuRow
        title={t('me.settings.contact.heading')}
        content={
          <Icon
            name='Mail'
            size={StyleConstants.Font.Size.M}
            color={colors.secondary}
          />
        }
        iconBack='ChevronRight'
        onPress={() => {
          if (instanceActive !== -1) {
            navigation.navigate('Screen-Compose', {
              type: 'conversation',
              accts: ['tooot@xmflsct.com']
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
