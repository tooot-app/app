import { SettingsV0 } from './v0'
import { SettingsV1 } from './v1'
import { SettingsV2 } from './v2'
import { SettingsV3 } from './v3'
import { SettingsV4 } from './v4'

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
  },
  4: (state: SettingsV3): SettingsV4 => {
    const { staticEmoji, ...rest } = state
    return { ...rest, autoplayGifv: true }
  }
}

export { SettingsV4 as SettingsLatest }

export default settingsMigration
