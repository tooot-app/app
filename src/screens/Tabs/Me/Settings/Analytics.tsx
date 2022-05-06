import { MenuContainer, MenuRow } from '@components/Menu'
import CustomText from '@components/Text'
import { useAppDispatch } from '@root/store'
import { getInstanceVersion } from '@utils/slices/instancesSlice'
import {
  changeAnalytics,
  getSettingsAnalytics
} from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import Constants from 'expo-constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const SettingsAnalytics: React.FC = () => {
  const dispatch = useAppDispatch()
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const settingsAnalytics = useSelector(getSettingsAnalytics)
  const instanceVersion = useSelector(getInstanceVersion, () => true)

  return (
    <MenuContainer>
      <MenuRow
        title={t('me.settings.analytics.heading')}
        description={t('me.settings.analytics.description')}
        switchValue={settingsAnalytics}
        switchOnValueChange={() =>
          dispatch(changeAnalytics(!settingsAnalytics))
        }
      />
      <CustomText
        fontStyle='S'
        style={{
          textAlign: 'center',
          marginTop: StyleConstants.Spacing.S,
          color: colors.secondary
        }}
      >
        {t('me.settings.version', { version: Constants.manifest?.version })}
      </CustomText>
      <CustomText
        fontStyle='S'
        style={{
          textAlign: 'center',
          color: colors.secondary
        }}
      >
        {t('me.settings.instanceVersion', { version: instanceVersion })}
      </CustomText>
    </MenuContainer>
  )
}

export default SettingsAnalytics
