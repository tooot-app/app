import { SettingsV0 } from './v0'
import { SettingsV1 } from './v1'

const settingsMigration = {
  1: (state: SettingsV0): SettingsV1 => {
    return {
      ...state,
      darkTheme: 'lighter'
    }
  }
}

export default settingsMigration
