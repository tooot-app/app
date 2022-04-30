import { MenuContainer, MenuRow } from '@components/Menu'
import { useAppDispatch } from '@root/store'
import {
  changeAnalytics,
  getSettingsAnalytics
} from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import Constants from 'expo-constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'

const SettingsAnalytics: React.FC = () => {
  const dispatch = useAppDispatch()
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const settingsAnalytics = useSelector(getSettingsAnalytics)

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
      <Text style={[styles.version, { color: colors.secondary }]}>
        {t('me.settings.version', { version: Constants.manifest?.version })}
      </Text>
    </MenuContainer>
  )
}

const styles = StyleSheet.create({
  version: {
    textAlign: 'center',
    ...StyleConstants.FontStyle.S,
    marginTop: StyleConstants.Spacing.M
  }
})

export default SettingsAnalytics
