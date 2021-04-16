import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { LOCALES } from '@root/i18n/locales'
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
  getSettingsTheme,
  getSettingsBrowser,
  getSettingsFontsize
} from '@utils/slices/settingsSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import * as Linking from 'expo-linking'
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
  const { t, i18n } = useTranslation('screenTabs')

  const instances = useSelector(getInstances, () => true)
  const instanceActive = useSelector(getInstanceActive)
  const settingsFontsize = useSelector(getSettingsFontsize)
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
            title={t('me.settings.profile.heading')}
            onPress={() => {
              analytics('settings_profile_press')
              Linking.openURL('https://${domain}/settings/profile')
            }}
          />
          <MenuRow
            title={t('me.settings.push.heading')}
            content={
              instancePush?.global.value
                ? t('me.settings.push.content.enabled')
                : t('me.settings.push.content.disabled')
            }
            iconBack='ChevronRight'
            onPress={() => {
              navigation.navigate('Tab-Me-Settings-Push')
            }}
          />
          <MenuRow
            title={t('me.settings.fontsize.heading')}
            content={t(
              `me.settings.fontsize.content.${mapFontsizeToName(settingsFontsize)}`
            )}
            iconBack='ChevronRight'
            onPress={() => {
              navigation.navigate('Tab-Me-Settings-Fontsize')
            }}
          />
        </>
      ) : null}
      <MenuRow
        title={t('me.settings.language.heading')}
        // @ts-ignore
        content={LOCALES[i18n.language]}
        iconBack='ChevronRight'
        onPress={() => {
          const options = Object.keys(LOCALES)
            // @ts-ignore
            .map(locale => LOCALES[locale])
            .concat(t('me.settings.language.options.cancel'))

          showActionSheetWithOptions(
            {
              title: t('me.settings.language.heading'),
              options,
              cancelButtonIndex: options.length - 1
            },
            buttonIndex => {
              if (buttonIndex < options.length - 1) {
                analytics('settings_language_press', {
                  current: i18n.language,
                  new: options[buttonIndex]
                })
                haptics('Success')

                // @ts-ignore
                dispatch(changeLanguage(Object.keys(LOCALES)[buttonIndex]))
                i18n.changeLanguage(Object.keys(LOCALES)[buttonIndex])

                // Update Android notification channel language
                if (Platform.OS === 'android') {
                  instances.forEach(instance => {
                    const accountFull = `@${instance.account.acct}@${instance.uri}`
                    if (instance.push.decode.value === false) {
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_default`,
                        {
                          groupId: accountFull,
                          name: t('me.push.default.heading'),
                          ...androidDefaults
                        }
                      )
                    } else {
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_follow`,
                        {
                          groupId: accountFull,
                          name: t('me.push.follow.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_favourite`,
                        {
                          groupId: accountFull,
                          name: t('me.push.favourite.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_reblog`,
                        {
                          groupId: accountFull,
                          name: t('me.push.reblog.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_mention`,
                        {
                          groupId: accountFull,
                          name: t('me.push.mention.heading'),
                          ...androidDefaults
                        }
                      )
                      Notifications.setNotificationChannelAsync(
                        `${accountFull}_poll`,
                        {
                          groupId: accountFull,
                          name: t('me.push.poll.heading'),
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
        title={t('me.settings.theme.heading')}
        content={t(`me.settings.theme.options.${settingsTheme}`)}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              title: t('me.settings.theme.heading'),
              options: [
                t('me.settings.theme.options.auto'),
                t('me.settings.theme.options.light'),
                t('me.settings.theme.options.dark'),
                t('me.settings.theme.options.cancel')
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
        title={t('me.settings.browser.heading')}
        content={t(`me.settings.browser.options.${settingsBrowser}`)}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              title: t('me.settings.browser.heading'),
              options: [
                t('me.settings.browser.options.internal'),
                t('me.settings.browser.options.external'),
                t('me.settings.browser.options.cancel')
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
