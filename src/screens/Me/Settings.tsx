import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActionSheetIOS } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { MenuContainer, MenuItem } from 'src/components/Menu'
import {
  changeLanguage,
  getSettingsLanguage
} from 'src/utils/slices/settingsSlice'

const ScreenMeSettings: React.FC = () => {
  const { t, i18n } = useTranslation('settings')
  const language = useSelector(getSettingsLanguage)
  const dispatch = useDispatch()
  console.log(i18n.language)

  return (
    <MenuContainer marginTop={true}>
      <MenuItem
        title={t('content.language.title')}
        content={t(`settings:content.language.options.${language}`)}
        iconBack='chevron-right'
        onPress={() =>
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: [
                t('settings:content.language.options.zh'),
                t('settings:content.language.options.en'),
                '取消'
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
    </MenuContainer>
  )
}

export default ScreenMeSettings
