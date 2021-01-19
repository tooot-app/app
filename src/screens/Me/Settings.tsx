import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { persistor } from '@root/store'
import {
  getLocalActiveIndex,
  getLocalInstances,
  getRemoteUrl
} from '@utils/slices/instancesSlice'
import {
  changeAnalytics,
  changeBrowser,
  changeLanguage,
  changeTheme,
  getSettingsAnalytics,
  getSettingsBrowser,
  getSettingsLanguage,
  getSettingsTheme
} from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import * as StoreReview from 'expo-store-review'
import prettyBytes from 'pretty-bytes'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'
import { CacheManager } from 'react-native-expo-image-cache'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

const DevDebug: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const localActiveIndex = useSelector(getLocalActiveIndex)
  const localInstances = useSelector(getLocalInstances)

  return (
    <MenuContainer>
      <MenuRow
        title={'Local active index'}
        content={typeof localActiveIndex + ' - ' + localActiveIndex}
        onPress={() => {}}
      />
      <MenuRow
        title={'Saved local instances'}
        content={localInstances.length.toString()}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              options: localInstances
                .map(instance => {
                  return instance.url + ': ' + instance.account.id
                })
                .concat(['Cancel']),
              cancelButtonIndex: localInstances.length
            },
            buttonIndex => {}
          )
        }
      />
      <Button
        type='text'
        content={'Purge secure storage'}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
          marginBottom: StyleConstants.Spacing.Global.PagePadding * 2
        }}
        destructive
        onPress={() => persistor.purge()}
      />
    </MenuContainer>
  )
}

const ScreenMeSettings: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const navigation = useNavigation()
  const { t, i18n } = useTranslation('meSettings')
  const { setTheme, theme } = useTheme()
  const settingsLanguage = useSelector(getSettingsLanguage)
  const settingsTheme = useSelector(getSettingsTheme)
  const settingsBrowser = useSelector(getSettingsBrowser)
  const settingsRemote = useSelector(getRemoteUrl)
  const settingsAnalytics = useSelector(getSettingsAnalytics)
  const dispatch = useDispatch()

  const [cacheSize, setCacheSize] = useState<number>()
  useEffect(() => {
    CacheManager.getCacheSize().then(size => setCacheSize(size))
  }, [])

  return (
    <ScrollView>
      <MenuContainer>
        <MenuRow
          title={t('content.language.heading')}
          content={t(`content.language.options.${settingsLanguage}`)}
          iconBack='ChevronRight'
          onPress={() => {
            const availableLanguages = Object.keys(
              i18n.services.resourceStore.data
            )
            const options = availableLanguages
              .map(language => t(`content.language.options.${language}`))
              .concat(t('content.language.options.cancel'))

            showActionSheetWithOptions(
              {
                title: t('content.language.heading'),
                options,
                cancelButtonIndex: i18n.languages.length
              },
              buttonIndex => {
                if (buttonIndex < i18n.languages.length) {
                  haptics('Success')
                  dispatch(changeLanguage(availableLanguages[buttonIndex]))
                  i18n.changeLanguage(availableLanguages[buttonIndex])
                }
              }
            )
          }}
        />
        <MenuRow
          title={t('content.theme.heading')}
          content={t(`content.theme.options.${settingsTheme}`)}
          iconBack='ChevronRight'
          onPress={() =>
            showActionSheetWithOptions(
              {
                title: t('content.theme.heading'),
                options: [
                  t('content.theme.options.auto'),
                  t('content.theme.options.light'),
                  t('content.theme.options.dark'),
                  t('content.theme.options.cancel')
                ],
                cancelButtonIndex: 3
              },
              buttonIndex => {
                switch (buttonIndex) {
                  case 0:
                    haptics('Success')
                    dispatch(changeTheme('auto'))
                    break
                  case 1:
                    haptics('Success')
                    dispatch(changeTheme('light'))
                    setTheme('light')
                    break
                  case 2:
                    haptics('Success')
                    dispatch(changeTheme('dark'))
                    setTheme('dark')
                    break
                }
              }
            )
          }
        />
        <MenuRow
          title={t('content.browser.heading')}
          content={t(`content.browser.options.${settingsBrowser}`)}
          iconBack='ChevronRight'
          onPress={() =>
            showActionSheetWithOptions(
              {
                title: t('content.browser.heading'),
                options: [
                  t('content.browser.options.internal'),
                  t('content.browser.options.external'),
                  t('content.browser.options.cancel')
                ],
                cancelButtonIndex: 2
              },
              buttonIndex => {
                switch (buttonIndex) {
                  case 0:
                    haptics('Success')
                    dispatch(changeBrowser('internal'))
                    break
                  case 1:
                    haptics('Success')
                    dispatch(changeBrowser('external'))
                    break
                }
              }
            )
          }
        />
      </MenuContainer>
      <MenuContainer>
        <MenuRow
          title={t('content.remote.heading')}
          description={t('content.remote.description')}
          content={settingsRemote}
          iconBack='ChevronRight'
          onPress={() => navigation.navigate('Screen-Me-Settings-UpdateRemote')}
        />
        <MenuRow
          title={t('content.cache.heading')}
          content={
            cacheSize ? prettyBytes(cacheSize) : t('content.cache.empty')
          }
          iconBack='ChevronRight'
          onPress={async () => {
            await CacheManager.clearCache()
            haptics('Success')
            setCacheSize(0)
          }}
        />
      </MenuContainer>
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
          onPress={() => Linking.openURL('https://www.patreon.com/xmflsct')}
        />
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
          onPress={() =>
            StoreReview.isAvailableAsync().then(() =>
              StoreReview.requestReview()
            )
          }
        />
      </MenuContainer>
      <MenuContainer>
        <MenuRow
          title={t('content.analytics.heading')}
          description={t('content.analytics.description')}
          switchValue={settingsAnalytics}
          switchOnValueChange={() =>
            dispatch(changeAnalytics(!settingsAnalytics))
          }
        />
        <Text style={[styles.version, { color: theme.secondary }]}>
          {t('content.version', { version: Constants.manifest.version })}
        </Text>
      </MenuContainer>

      {__DEV__ || Constants.manifest.releaseChannel === 'testing' ? (
        <DevDebug />
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  version: {
    textAlign: 'center',
    ...StyleConstants.FontStyle.S,
    marginTop: StyleConstants.Spacing.M
  }
})

export default ScreenMeSettings
