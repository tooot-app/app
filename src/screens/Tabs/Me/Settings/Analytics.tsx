import { MenuContainer, MenuRow } from '@components/Menu'
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
import { useDispatch, useSelector } from 'react-redux'

const SettingsAnalytics: React.FC = () => {
  const dispatch = useDispatch()
  const { theme } = useTheme()
  const { t } = useTranslation('meSettings')

  const settingsAnalytics = useSelector(getSettingsAnalytics)

  return (
    <MenuContainer>
      <MenuRow
        title={t('content.analytics.heading')}
        description={t('content.analytics.description')}
        switchValue={settingsAnalytics}
        switchOnValueChange={() =>
          dispatch(changeAnalytics(!settingsAnalytics))
        }
      />
      <Text style={[styles.version, { color: theme.secondary }]}>
        {t('content.version', {
          version: Constants.manifest.version,
          releaseChannel: Constants.manifest.releaseChannel || 'dev'
        })}
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
