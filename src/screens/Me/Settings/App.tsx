import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import i18n from '@root/i18n/i18n'
import {
  changeBrowser,
  changeLanguage,
  changeTheme,
  getSettingsLanguage,
  getSettingsTheme,
  getSettingsBrowser
} from '@utils/slices/settingsSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import prettyBytes from 'pretty-bytes'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CacheManager } from 'react-native-expo-image-cache'
import { useDispatch, useSelector } from 'react-redux'

const SettingsApp: React.FC = () => {
  const dispatch = useDispatch()
  const { showActionSheetWithOptions } = useActionSheet()
  const { setTheme } = useTheme()
  const { t } = useTranslation('meSettings')

  const settingsLanguage = useSelector(getSettingsLanguage)
  const settingsTheme = useSelector(getSettingsTheme)
  const settingsBrowser = useSelector(getSettingsBrowser)

  const [cacheSize, setCacheSize] = useState<number>()
  useEffect(() => {
    CacheManager.getCacheSize().then(size => setCacheSize(size))
  }, [])

  return (
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
              cancelButtonIndex: options.length - 1
            },
            buttonIndex => {
              if (buttonIndex < options.length) {
                analytics('settings_language_press', {
                  current: i18n.language,
                  new: availableLanguages[buttonIndex]
                })
                haptics('Success')
                // @ts-ignore
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
                  analytics('settings_appearance_press', {
                    current: settingsTheme,
                    new: 'auto'
                  })
                  haptics('Success')
                  dispatch(changeTheme('auto'))
                  break
                case 1:
                  analytics('settings_appearance_press', {
                    current: settingsTheme,
                    new: 'light'
                  })
                  haptics('Success')
                  dispatch(changeTheme('light'))
                  setTheme('light')
                  break
                case 2:
                  analytics('settings_appearance_press', {
                    current: settingsTheme,
                    new: 'dark'
                  })
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
                  analytics('settings_browser_press', {
                    current: settingsBrowser,
                    new: 'internal'
                  })
                  haptics('Success')
                  dispatch(changeBrowser('internal'))
                  break
                case 1:
                  analytics('settings_browser_press', {
                    current: settingsBrowser,
                    new: 'external'
                  })
                  haptics('Success')
                  dispatch(changeBrowser('external'))
                  break
              }
            }
          )
        }
      />
      <MenuRow
        title={t('content.cache.heading')}
        content={cacheSize ? prettyBytes(cacheSize) : t('content.cache.empty')}
        iconBack='ChevronRight'
        onPress={async () => {
          analytics('settings_cache_press', {
            size: cacheSize ? prettyBytes(cacheSize) : 'empty'
          })
          await CacheManager.clearCache()
          haptics('Success')
          setCacheSize(0)
        }}
      />
    </MenuContainer>
  )
}

export default SettingsApp
