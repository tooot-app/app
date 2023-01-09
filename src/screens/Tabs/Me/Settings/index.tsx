import { isDevelopment } from '@utils/helpers/checkEnvironment'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import SettingsAnalytics from './Analytics'
import SettingsApp from './App'
import SettingsDev from './Dev'
import SettingsTooot from './Tooot'

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
