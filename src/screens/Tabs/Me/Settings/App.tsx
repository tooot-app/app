import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { androidActionSheetStyles } from '@helpers/androidActionSheetStyles'
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
import { useTheme } from '@utils/styles/ThemeManager'
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
  const { colors } = useTheme()
  const { t, i18n } = useTranslation(['common', 'screenTabs'])

  const settingsFontsize = useSelector(getSettingsFontsize)
  const settingsTheme = useSelector(getSettingsTheme)
  const settingsDarkTheme = useSelector(getSettingsDarkTheme)
  const settingsBrowser = useSelector(getSettingsBrowser)
  const settingsStaticEmoji = useSelector(getSettingsStaticEmoji)

  return (
    <MenuContainer>
      <MenuRow
        title={t('screenTabs:me.settings.fontsize.heading')}
        content={t(
          `screenTabs:me.settings.fontsize.content.${mapFontsizeToName(settingsFontsize)}`
        )}
        iconBack='ChevronRight'
        onPress={() => navigation.navigate('Tab-Me-Settings-Fontsize')}
      />
      <MenuRow
        title={t('screenTabs:me.settings.language.heading')}
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
        title={t('screenTabs:me.settings.theme.heading')}
        content={t(`screenTabs:me.settings.theme.options.${settingsTheme}`)}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              title: t('screenTabs:me.settings.theme.heading'),
              options: [
                t('screenTabs:me.settings.theme.options.auto'),
                t('screenTabs:me.settings.theme.options.light'),
                t('screenTabs:me.settings.theme.options.dark'),
                t('common:buttons.cancel')
              ],
              cancelButtonIndex: 3,
              ...androidActionSheetStyles(colors)
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
                  break
                case 2:
                  haptics('Success')
                  dispatch(changeTheme('dark'))
                  break
              }
            }
          )
        }
      />
      <MenuRow
        title={t('screenTabs:me.settings.darkTheme.heading')}
        content={t(`screenTabs:me.settings.darkTheme.options.${settingsDarkTheme}`)}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              title: t('screenTabs:me.settings.darkTheme.heading'),
              options: [
                t('screenTabs:me.settings.darkTheme.options.lighter'),
                t('screenTabs:me.settings.darkTheme.options.darker'),
                t('common:buttons.cancel')
              ],
              cancelButtonIndex: 2,
              ...androidActionSheetStyles(colors)
            },
            buttonIndex => {
              switch (buttonIndex) {
                case 0:
                  haptics('Success')
                  dispatch(changeDarkTheme('lighter'))
                  break
                case 1:
                  haptics('Success')
                  dispatch(changeDarkTheme('darker'))
                  break
              }
            }
          )
        }
      />
      <MenuRow
        title={t('screenTabs:me.settings.browser.heading')}
        content={t(`screenTabs:me.settings.browser.options.${settingsBrowser}`)}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              title: t('screenTabs:me.settings.browser.heading'),
              options: [
                t('screenTabs:me.settings.browser.options.internal'),
                t('screenTabs:me.settings.browser.options.external'),
                t('common:buttons.cancel')
              ],
              cancelButtonIndex: 2,
              ...androidActionSheetStyles(colors)
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
      <MenuRow
        title={t('screenTabs:me.settings.staticEmoji.heading')}
        description={t('screenTabs:me.settings.staticEmoji.description')}
        switchValue={settingsStaticEmoji}
        switchOnValueChange={() => dispatch(changeStaticEmoji(!settingsStaticEmoji))}
      />
    </MenuContainer>
  )
}

export default SettingsApp
