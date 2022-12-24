import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LOCALES } from '@root/i18n/locales'
import { RootState } from '@root/store'
import { SettingsLatest } from '@utils/migrations/settings/migration'
import * as Localization from 'expo-localization'
import { pickBy } from 'lodash'

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
  autoplayGifv: true
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState as SettingsLatest,
  reducers: {
    changeFontsize: (state, action: PayloadAction<SettingsLatest['fontsize']>) => {
      state.fontsize = action.payload
    },
    changeLanguage: (state, action: PayloadAction<NonNullable<SettingsLatest['language']>>) => {
      state.language = action.payload
    },
    changeTheme: (state, action: PayloadAction<NonNullable<SettingsLatest['theme']>>) => {
      state.theme = action.payload
    },
    changeDarkTheme: (state, action: PayloadAction<NonNullable<SettingsLatest['darkTheme']>>) => {
      state.darkTheme = action.payload
    },
    changeBrowser: (state, action: PayloadAction<NonNullable<SettingsLatest['browser']>>) => {
      state.browser = action.payload
    },
    changeAutoplayGifv: (
      state,
      action: PayloadAction<NonNullable<SettingsLatest['autoplayGifv']>>
    ) => {
      state.autoplayGifv = action.payload
    }
  }
})

export const getSettingsFontsize = (state: RootState) => state.settings.fontsize || 0
export const getSettingsLanguage = (state: RootState) => state.settings.language
export const getSettingsTheme = (state: RootState) => state.settings.theme
export const getSettingsDarkTheme = (state: RootState) => state.settings.darkTheme
export const getSettingsBrowser = (state: RootState) => state.settings.browser
export const getSettingsAutoplayGifv = (state: RootState) => state.settings.autoplayGifv

export const {
  changeFontsize,
  changeLanguage,
  changeTheme,
  changeDarkTheme,
  changeBrowser,
  changeAutoplayGifv
} = settingsSlice.actions
export default settingsSlice.reducer
