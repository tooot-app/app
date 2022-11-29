import { MenuContainer } from '@components/Menu'
import CustomText from '@components/Text'
import { getInstanceVersion } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import Constants from 'expo-constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const SettingsAnalytics: React.FC = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const instanceVersion = useSelector(getInstanceVersion, () => true)

  return (
    <>
      <MenuContainer>
        <CustomText
          fontStyle='S'
          style={{
            textAlign: 'center',
            marginTop: StyleConstants.Spacing.S,
            color: colors.secondary
          }}
        >
          {t('me.settings.version', { version: Constants.expoConfig?.version })}
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
    </>
  )
}

export default SettingsAnalytics
