import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import i18n from '@root/i18n/i18n'
import androidDefaults from '@utils/slices/instances/push/androidDefaults'
import {
  getInstanceActive,
  getInstancePush,
  getInstances
} from '@utils/slices/instancesSlice'
import {
  changeBrowser,
  changeLanguage,
  changeTheme,
  getSettingsLanguage,
  getSettingsTheme,
  getSettingsBrowser,
  getSettingsFontsize
} from '@utils/slices/settingsSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { mapFontsizeToName } from '../Fontsize'

const SettingsApp: React.FC = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { showActionSheetWithOptions } = useActionSheet()
  const { setTheme } = useTheme()
  const { t } = useTranslation('meSettings')

  const instances = useSelector(getInstances, () => true)
  const instanceActive = useSelector(getInstanceActive)
  const settingsFontsize = useSelector(getSettingsFontsize)
  const settingsLanguage = useSelector(getSettingsLanguage)
  const settingsTheme = useSelector(getSettingsTheme)
  const settingsBrowser = useSelector(getSettingsBrowser)
  const instancePush = useSelector(
    getInstancePush,
    (prev, next) => prev?.global.value === next?.global.value
  )

  return (
    <MenuContainer>
      {instanceActive !== -1 ? (
        <>
          <MenuRow
            title={t('content.push.heading')}
            content={
              instancePush?.global.value
                ? t('content.push.content.enabled')
                : t('content.push.content.disabled')
            }
            iconBack='ChevronRight'
            onPress={() => {
              navigation.navigate('Tab-Me-Settings-Push')
            }}
          />
          <MenuRow
            title={t('content.fontsize.heading')}
            content={t(
              `content.fontsize.content.${mapFontsizeToName(settingsFontsize)}`
            )}
            iconBack='ChevronRight'
            onPress={() => {
              navigation.navigate('Tab-Me-Settings-Fontsize')
            }}
          />
        </>
      ) : null}
      <MenuRow
        title={t('content.language.heading')}
        content={t(`content.language.options.${settingsLanguage}`)}
        iconBack='ChevronRight'
        onPress={() => {
          const availableLanguages = Object.keys(
            i18n.services.resourceStore.data
          )
          const options = availableLanguages
            .map(language => {
              return t(`content.language.options.${language}`)
            })
            .concat(t('content.language.options.cancel'))

          showActionSheetWithOptions(
            {
              title: t('content.language.heading'),
              options,
              cancelButtonIndex: options.length - 1
            },
            buttonIndex => {
              if (buttonIndex < options.length - 1) {
                analytics('settings_language_press', {
                  current: i18n.language,
                  new: availableLanguages[buttonIndex]
                })
                haptics('Success')

                // @ts-ignore
                dispatch(changeLanguage(availableLanguages[buttonIndex]))
                i18n.changeLanguage(availableLanguages[buttonIndex])

                // Update Android notification channel language
                if (Platform.OS === 'android') {
                  instances.forEach(instance => {
                    const accountFull = `@${instance.account.acct}@${instance.uri}`
                    if (instance.push.decode.value === false) {
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_default`,
                        {
                          groupId: accountFull,
                          name: t('meSettingsPush:content.default.heading'),
                          ...androidDefaults
                        }
                      )
                    } else {
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_follow`,
                        {
                          groupId: accountFull,
                          name: t('meSettingsPush:content.follow.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_favourite`,
                        {
                          groupId: accountFull,
                          name: t('meSettingsPush:content.favourite.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_reblog`,
                        {
                          groupId: accountFull,
                          name: t('meSettingsPush:content.reblog.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_mention`,
                        {
                          groupId: accountFull,
                          name: t('meSettingsPush:content.mention.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_poll`,
                        {
                          groupId: accountFull,
                          name: t('meSettingsPush:content.poll.heading'),
                          ...androidDefaults
                        }
                      )
                    }
                  })
                }
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
    </MenuContainer>
  )
}

export default SettingsApp
