import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { LOCALES } from '@root/i18n/locales'
import { useAppDispatch } from '@root/store'
import {
  changeBrowser,
  changeTheme,
  getSettingsTheme,
  getSettingsBrowser,
  getSettingsFontsize,
  getSettingsDarkTheme,
  changeDarkTheme,
  getSettingsStaticEmoji,
  changeStaticEmoji
} from '@utils/slices/settingsSlice'
import * as Localization from 'expo-localization'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import { mapFontsizeToName } from '../SettingsFontsize'

const SettingsApp: React.FC = () => {
  const navigation = useNavigation<any>()
  const dispatch = useAppDispatch()
  const { showActionSheetWithOptions } = useActionSheet()
  const { t, i18n } = useTranslation('screenTabs')

  const settingsFontsize = useSelector(getSettingsFontsize)
  const settingsTheme = useSelector(getSettingsTheme)
  const settingsDarkTheme = useSelector(getSettingsDarkTheme)
  const settingsBrowser = useSelector(getSettingsBrowser)
  const settingsStaticEmoji = useSelector(getSettingsStaticEmoji)

  return (
    <MenuContainer>
      <MenuRow
        title={t('me.settings.fontsize.heading')}
        content={t(`me.settings.fontsize.content.${mapFontsizeToName(settingsFontsize)}`)}
        iconBack='ChevronRight'
        onPress={() => navigation.navigate('Tab-Me-Settings-Fontsize')}
      />
      <MenuRow
        title={t('me.settings.language.heading')}
        content={
          // @ts-ignore
          LOCALES[
            Platform.OS === 'ios' ? Localization.locale.toLowerCase() : i18n.language.toLowerCase()
          ]
        }
        iconBack='ChevronRight'
        onPress={() =>
          Platform.OS === 'ios'
            ? Linking.openSettings()
            : navigation.navigate('Tab-Me-Settings-Language')
        }
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
                  break
                case 2:
                  analytics('settings_appearance_press', {
                    current: settingsTheme,
                    new: 'dark'
                  })
                  haptics('Success')
                  dispatch(changeTheme('dark'))
                  break
              }
            }
          )
        }
      />
      <MenuRow
        title={t('me.settings.darkTheme.heading')}
        content={t(`me.settings.darkTheme.options.${settingsDarkTheme}`)}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              title: t('me.settings.darkTheme.heading'),
              options: [
                t('me.settings.darkTheme.options.lighter'),
                t('me.settings.darkTheme.options.darker'),
                t('me.settings.darkTheme.options.cancel')
              ],
              cancelButtonIndex: 2
            },
            buttonIndex => {
              switch (buttonIndex) {
                case 0:
                  analytics('settings_darktheme_press', {
                    current: settingsDarkTheme,
                    new: 'lighter'
                  })
                  haptics('Success')
                  dispatch(changeDarkTheme('lighter'))
                  break
                case 1:
                  analytics('settings_darktheme_press', {
                    current: settingsDarkTheme,
                    new: 'darker'
                  })
                  haptics('Success')
                  dispatch(changeDarkTheme('darker'))
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
      <MenuRow
        title={t('me.settings.staticEmoji.heading')}
        description={t('me.settings.staticEmoji.description')}
        switchValue={settingsStaticEmoji}
        switchOnValueChange={() => {
          analytics('settings_staticemoji_press', {
            current: settingsStaticEmoji.toString(),
            new: !settingsStaticEmoji.toString()
          })
          dispatch(changeStaticEmoji(!settingsStaticEmoji))
        }}
      />
    </MenuContainer>
  )
}

export default SettingsApp
