import { SettingsV0 } from './v0'
import { SettingsV1 } from './v1'
import { SettingsV2 } from './v2'
import { SettingsV3 } from './v3'

const settingsMigration = {
  1: (state: SettingsV0): SettingsV1 => {
    return {
      ...state,
      darkTheme: 'lighter'
    }
  },
  2: (state: SettingsV1): SettingsV2 => {
    return {
      ...state,
      darkTheme: 'lighter',
      staticEmoji: false
    }
  },
  3: (state: SettingsV2): SettingsV3 => {
    const { analytics, ...rest } = state
    return rest
  }
}

export default settingsMigration
