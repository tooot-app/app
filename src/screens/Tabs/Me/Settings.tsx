import Constants from 'expo-constants'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import SettingsAnalytics from './Settings/Analytics'
import SettingsApp from './Settings/App'
import SettingsDev from './Settings/Dev'
import SettingsTooot from './Settings/Tooot'

const ScreenMeSettings: React.FC = () => {
  return (
    <ScrollView>
      <SettingsApp />
      <SettingsTooot />
      <SettingsAnalytics />

      {__DEV__ ||
      ['development'].some(channel =>
        Constants.manifest.releaseChannel?.includes(channel)
      ) ? (
        <SettingsDev />
      ) : null}
    </ScrollView>
  )
}

export default ScreenMeSettings
