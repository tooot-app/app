import apiTooot from '@api/tooot'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { isDevelopment } from '@utils/checkEnvironment'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'

export const retrieveExpoToken = createAsyncThunk('app/expoToken', async (): Promise<string> => {
  if (isDevelopment) {
    return 'ExponentPushToken[DEVELOPMENT_1]'
  }

  const res = await Notifications.getExpoPushTokenAsync({
    experienceId: '@xmflsct/tooot',
    applicationId: 'com.xmflsct.app.tooot'
  })
  return res.data
})

export const retrieveVersionLatest = createAsyncThunk(
  'app/versionUpdate',
  async (): Promise<string> => {
    const res = await apiTooot<{ latest: string }>({ method: 'get', url: 'version.json' })
    return res.body.latest
  }
)

export type AppState = {
  expoToken?: string
  versionUpdate: boolean
}

export const appInitialState: AppState = {
  expoToken: undefined,
  versionUpdate: false
}

const appSlice = createSlice({
  name: 'app',
  initialState: appInitialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(retrieveExpoToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.expoToken = action.payload
        }
      })
      .addCase(retrieveVersionLatest.fulfilled, (state, action) => {
        if (action.payload && Constants.expoConfig?.version) {
          state.versionUpdate =
            parseFloat(action.payload) > parseFloat(Constants.expoConfig.version)
        }
      })
  }
})

export const getExpoToken = (state: RootState) => state.app.expoToken
export const getVersionUpdate = (state: RootState) => state.app.versionUpdate

export default appSlice.reducer
