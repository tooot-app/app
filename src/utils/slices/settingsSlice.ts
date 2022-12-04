import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LOCALES } from '@root/i18n/locales'
import { RootState } from '@root/store'
import { SettingsV3 } from '@utils/migrations/settings/v3'
import * as Localization from 'expo-localization'
import { pickBy } from 'lodash'

export type SettingsState = SettingsV3

export const settingsInitialState = {
  fontsize: 0,
  notification: {
    enabled: false
  },
  language: Object.keys(pickBy(LOCALES, (_, key) => Localization.locale.startsWith(key)))
    ? Object.keys(pickBy(LOCALES, (_, key) => Localization.locale.startsWith(key)))[0]
    : 'en',
  theme: 'auto',
  darkTheme: 'lighter',
  browser: 'internal',
  staticEmoji: false
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState as SettingsState,
  reducers: {
    changeFontsize: (state, action: PayloadAction<SettingsState['fontsize']>) => {
      state.fontsize = action.payload
    },
    changeLanguage: (state, action: PayloadAction<NonNullable<SettingsState['language']>>) => {
      state.language = action.payload
    },
    changeTheme: (state, action: PayloadAction<NonNullable<SettingsState['theme']>>) => {
      state.theme = action.payload
    },
    changeDarkTheme: (state, action: PayloadAction<NonNullable<SettingsState['darkTheme']>>) => {
      state.darkTheme = action.payload
    },
    changeBrowser: (state, action: PayloadAction<NonNullable<SettingsState['browser']>>) => {
      state.browser = action.payload
    },
    changeStaticEmoji: (
      state,
      action: PayloadAction<NonNullable<SettingsState['staticEmoji']>>
    ) => {
      state.staticEmoji = action.payload
    }
  }
})

export const getSettingsFontsize = (state: RootState) => state.settings.fontsize || 0
export const getSettingsLanguage = (state: RootState) => state.settings.language
export const getSettingsTheme = (state: RootState) => state.settings.theme
export const getSettingsDarkTheme = (state: RootState) => state.settings.darkTheme
export const getSettingsBrowser = (state: RootState) => state.settings.browser
export const getSettingsStaticEmoji = (state: RootState) => state.settings.staticEmoji

export const {
  changeFontsize,
  changeLanguage,
  changeTheme,
  changeDarkTheme,
  changeBrowser,
  changeStaticEmoji
} = settingsSlice.actions
export default settingsSlice.reducer
