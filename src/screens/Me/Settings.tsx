import prettyBytes from 'pretty-bytes'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionSheetIOS, StyleSheet, Text } from 'react-native'
import { CacheManager } from 'react-native-expo-image-cache'
import { useDispatch, useSelector } from 'react-redux'
import { MenuContainer, MenuRow } from '@components/Menu'
import {
  changeBrowser,
  changeLanguage,
  changeTheme,
  getSettingsBrowser,
  getSettingsLanguage,
  getSettingsTheme
} from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

const ScreenMeSettings: React.FC = () => {
  const { t, i18n } = useTranslation('meSettings')
  const { setTheme, theme } = useTheme()
  const settingsLanguage = useSelector(getSettingsLanguage)
  const settingsTheme = useSelector(getSettingsTheme)
  const settingsBrowser = useSelector(getSettingsBrowser)
  const dispatch = useDispatch()

  const [cacheSize, setCacheSize] = useState<number>()
  useEffect(() => {
    CacheManager.getCacheSize().then(size => setCacheSize(size))
  }, [])

  return (
    <>
      <MenuContainer>
        <MenuRow
          title={t('content.language.heading')}
          content={t(`content.language.options.${settingsLanguage}`)}
          iconBack='chevron-right'
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: [
                  t('content.language.options.zh'),
                  t('content.language.options.en'),
                  t('content.language.options.cancel')
                ],
                cancelButtonIndex: 2
              },
              buttonIndex => {
                switch (buttonIndex) {
                  case 0:
                    dispatch(changeLanguage('zh'))
                    i18n.changeLanguage('zh')
                    break
                  case 1:
                    dispatch(changeLanguage('en'))
                    i18n.changeLanguage('en')
                    break
                }
              }
            )
          }
        />
        <MenuRow
          title={t('content.theme.heading')}
          content={t(`content.theme.options.${settingsTheme}`)}
          iconBack='chevron-right'
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
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
                    dispatch(changeTheme('auto'))
                    break
                  case 1:
                    dispatch(changeTheme('light'))
                    setTheme('light')
                    break
                  case 2:
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
          iconBack='chevron-right'
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
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
                    dispatch(changeBrowser('internal'))
                    break
                  case 1:
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
          title={t('content.cache.heading')}
          content={cacheSize ? prettyBytes(cacheSize) : '暂无缓存'}
          iconBack='chevron-right'
          onPress={async () => {
            await CacheManager.clearCache()
            setCacheSize(0)
          }}
        />
        <MenuRow
          title={t('content.copyrights.heading')}
          iconBack='chevron-right'
        />
        <Text style={[styles.version, { color: theme.secondary }]}>
          {t('content.version', { version: '1.0.0' })}
        </Text>
      </MenuContainer>
    </>
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
