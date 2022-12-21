import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { isDevelopment } from '@utils/checkEnvironment'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { setChannels } from './instances/push/utils'
import { getInstance } from './instancesSlice'

export const retrieveExpoToken = createAsyncThunk(
  'app/expoToken',
  async (_, { getState }): Promise<string> => {
    const instance = getInstance(getState() as RootState)
    const expoToken = getExpoToken(getState() as RootState)

    if (Platform.OS === 'android') {
      await setChannels(instance)
    }

    if (expoToken?.length) {
      return expoToken
    } else {
      if (isDevelopment) {
        return 'ExponentPushToken[DEVELOPMENT_1]'
      }

      const res = await Notifications.getExpoPushTokenAsync({
        experienceId: '@xmflsct/tooot',
        applicationId: 'com.xmflsct.app.tooot'
      })
      return res.data
    }
  }
)

export type AppState = {
  expoToken?: string
}

export const appInitialState: AppState = {
  expoToken: undefined
}

const appSlice = createSlice({
  name: 'app',
  initialState: appInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(retrieveExpoToken.fulfilled, (state, action) => {
      if (action.payload) {
        state.expoToken = action.payload
      }
    })
  }
})

export const getExpoToken = (state: RootState) => state.app.expoToken

export default appSlice.reducer
