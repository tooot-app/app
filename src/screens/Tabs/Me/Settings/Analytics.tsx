import { MenuContainer } from '@components/Menu'
import CustomText from '@components/Text'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import Constants from 'expo-constants'
import React from 'react'
import { useTranslation } from 'react-i18next'

const SettingsAnalytics: React.FC = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

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
          {t('me.settings.instanceVersion', { version: getAccountStorage.string('version') })}
        </CustomText>
      </MenuContainer>
    </>
  )
}

export default SettingsAnalytics
