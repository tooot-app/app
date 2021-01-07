import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import * as Analytics from 'expo-firebase-analytics'

export type SettingsState = {
  language: 'zh' | 'en' | undefined
  theme: 'light' | 'dark' | 'auto'
  browser: 'internal' | 'external'
  analytics: boolean
}

export const settingsInitialState = {
  language: undefined,
  theme: 'auto',
  browser: 'internal',
  analytics: true
}

export const changeAnalytics = createAsyncThunk(
  'settings/changeAnalytics',
  async (newValue: SettingsState['analytics']) => {
    await Analytics.setAnalyticsCollectionEnabled(newValue)
    return newValue
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState as SettingsState,
  reducers: {
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
      state.analytics = action.payload
    })
  }
})

export const getSettingsLanguage = (state: RootState) => state.settings.language
export const getSettingsTheme = (state: RootState) => state.settings.theme
export const getSettingsBrowser = (state: RootState) => state.settings.browser
export const getSettingsAnalytics = (state: RootState) =>
  state.settings.analytics

export const {
  changeLanguage,
  changeTheme,
  changeBrowser
} = settingsSlice.actions
export default settingsSlice.reducer
