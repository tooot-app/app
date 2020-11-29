import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActionSheetIOS } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { MenuContainer, MenuItem } from 'src/components/Menu'
import {
  changeLanguage,
  changeTheme,
  getSettingsLanguage,
  getSettingsTheme
} from 'src/utils/slices/settingsSlice'
import { useTheme } from 'src/utils/styles/ThemeManager'

const ScreenMeSettings: React.FC = () => {
  const { t, i18n } = useTranslation('meSettings')
  const { setTheme } = useTheme()
  const settingsLanguage = useSelector(getSettingsLanguage)
  const settingsTheme = useSelector(getSettingsTheme)
  const dispatch = useDispatch()

  return (
    <MenuContainer marginTop={true}>
      <MenuItem
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
      <MenuItem
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
    </MenuContainer>
  )
}

export default ScreenMeSettings
