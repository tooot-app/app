import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { LOCALES } from '@i18n/locales'
import { useNavigation } from '@react-navigation/native'
import { connectVerify } from '@utils/api/helpers/connect'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
import { GLOBAL } from '@utils/storage'
import { useGlobalStorage } from '@utils/storage/actions'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform } from 'react-native'
import { mapFontsizeToName } from '../SettingsFontsize'

const SettingsApp: React.FC = () => {
  const navigation = useNavigation<any>()
  const { showActionSheetWithOptions } = useActionSheet()
  const { colors } = useTheme()
  const { t, i18n } = useTranslation(['common', 'screenTabs'])

  const [fontSize] = useGlobalStorage.number('app.font_size')
  const [theme, setTheme] = useGlobalStorage.string('app.theme')
  const [themeDark, setThemeDark] = useGlobalStorage.string('app.theme.dark')
  const [browser, setBrowser] = useGlobalStorage.string('app.browser')
  const [autoplayGifv, setAutoplayGifv] = useGlobalStorage.boolean('app.auto_play_gifv')

  const [connect, setConnect] = useGlobalStorage.boolean('app.connect')
  const [showConnect, setShowConnect] = useState(connect)
  useEffect(() => {
    connectVerify()
      .then(() => {
        setShowConnect(true)
      })
      .catch(() => {
        if (connect) {
          GLOBAL.connect = false
        } else {
          setShowConnect(false)
        }
      })
  }, [])

  return (
    <MenuContainer>
      <MenuRow
        title={t('screenTabs:me.stacks.fontSize.name')}
        content={t(`screenTabs:me.fontSize.sizes.${mapFontsizeToName(fontSize || 0)}`)}
        iconBack='chevron-right'
        onPress={() => navigation.navigate('Tab-Me-Settings-Fontsize')}
      />
      <MenuRow
        title={t('screenTabs:me.stacks.language.name')}
        content={
          // @ts-ignore
          LOCALES[
            Platform.OS === 'ios'
              ? Localization.locale.replace(new RegExp(/.*-.*(-.*)/, 'i'), '').toLowerCase()
              : i18n.language.toLowerCase()
          ]
        }
        iconBack='chevron-right'
        onPress={() =>
          Platform.OS === 'ios'
            ? Linking.openSettings()
            : navigation.navigate('Tab-Me-Settings-Language')
        }
      />
      <MenuRow
        title={t('screenTabs:me.settings.theme.heading')}
        content={t(`screenTabs:me.settings.theme.options.${theme || 'auto'}`)}
        iconBack='chevron-right'
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
                  haptics('Light')
                  setTheme('auto')
                  break
                case 1:
                  haptics('Light')
                  setTheme('light')
                  break
                case 2:
                  haptics('Light')
                  setTheme('dark')
                  break
              }
            }
          )
        }
      />
      <MenuRow
        title={t('screenTabs:me.settings.darkTheme.heading')}
        content={t(`screenTabs:me.settings.darkTheme.options.${themeDark || 'lighter'}`)}
        iconBack='chevron-right'
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
                  haptics('Light')
                  setThemeDark('lighter')
                  break
                case 1:
                  haptics('Light')
                  setThemeDark('darker')
                  break
              }
            }
          )
        }
      />
      <MenuRow
        title={t('screenTabs:me.settings.browser.heading')}
        content={t(`screenTabs:me.settings.browser.options.${browser || 'internal'}`)}
        iconBack='chevron-right'
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
                  haptics('Light')
                  setBrowser('internal')
                  break
                case 1:
                  haptics('Light')
                  setBrowser('external')
                  break
              }
            }
          )
        }
      />
      <MenuRow
        title={t('screenTabs:me.settings.autoplayGifv.heading')}
        switchValue={autoplayGifv || false}
        switchOnValueChange={() => setAutoplayGifv(!autoplayGifv)}
      />
      {showConnect ? (
        <MenuRow
          title='使用免费🪜'
          switchValue={connect || false}
          switchOnValueChange={() => {
            GLOBAL.connect = !connect
            setConnect(!connect)
          }}
        />
      ) : null}
    </MenuContainer>
  )
}

export default SettingsApp
