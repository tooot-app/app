import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LOCALES } from '@root/i18n/locales'
import { RootState } from '@root/store'
import * as Analytics from 'expo-firebase-analytics'
import * as Localization from 'expo-localization'
import { pickBy } from 'lodash'

export const changeAnalytics = createAsyncThunk(
  'settings/changeAnalytics',
  async (newValue: SettingsState['analytics']) => {
    await Analytics.setAnalyticsCollectionEnabled(newValue)
    return { newValue }
  }
)

export type SettingsState = {
  fontsize: -1 | 0 | 1 | 2 | 3
  language: string
  theme: 'light' | 'dark' | 'auto'
  browser: 'internal' | 'external'
  analytics: boolean
}

export const settingsInitialState = {
  fontsize: 0,
  notification: {
    enabled: false
  },
  language: Object.keys(
    pickBy(LOCALES, (_, key) => Localization.locale.startsWith(key))
  )
    ? Object.keys(
        pickBy(LOCALES, (_, key) => Localization.locale.startsWith(key))
      )[0]
    : 'en',
  theme: 'auto',
  browser: 'internal',
  analytics: true
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState as SettingsState,
  reducers: {
    changeFontsize: (
      state,
      action: PayloadAction<SettingsState['fontsize']>
    ) => {
      state.fontsize = action.payload
    },
    changeLanguage: (
      state,
      action: PayloadAction<NonNullable<SettingsState['language']>>
    ) => {
      state.language = action.payload
    },
    changeTheme: (
      state,
      action: PayloadAction<NonNullable<SettingsState['theme']>>
    ) => {
      state.theme = action.payload
    },
    changeBrowser: (
      state,
      action: PayloadAction<NonNullable<SettingsState['browser']>>
    ) => {
      state.browser = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(changeAnalytics.fulfilled, (state, action) => {
      state.analytics = action.payload.newValue
    })
  }
})

export const getSettingsFontsize = (state: RootState) =>
  state.settings.fontsize || 0
export const getSettingsLanguage = (state: RootState) => state.settings.language
export const getSettingsTheme = (state: RootState) => state.settings.theme
export const getSettingsBrowser = (state: RootState) => state.settings.browser
export const getSettingsAnalytics = (state: RootState) =>
  state.settings.analytics

export const { changeFontsize, changeLanguage, changeTheme, changeBrowser } =
  settingsSlice.actions
export default settingsSlice.reducer
