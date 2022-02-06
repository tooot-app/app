import { isDevelopment } from '@utils/checkEnvironment'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import SettingsAnalytics from './Settings/Analytics'
import SettingsApp from './Settings/App'
import SettingsDev from './Settings/Dev'
import SettingsTooot from './Settings/Tooot'

const TabMeSettings: React.FC = () => {
  return (
    <ScrollView>
      <SettingsApp />
      <SettingsTooot />
      <SettingsAnalytics />

      {isDevelopment ? <SettingsDev /> : null}
    </ScrollView>
  )
}

export default TabMeSettings
