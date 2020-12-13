import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from '@root/store'
// import client from 'src/api/client'

export type SettingsState = {
  language: 'zh' | 'en' | undefined
  theme: 'light' | 'dark' | 'auto'
}

const initialState = {
  language: undefined,
  theme: 'auto'
}

// export const updateLocal = createAsyncThunk(
//   'instances/updateLocal',
//   async ({
//     url,
//     token
//   }: {
//     url?: InstancesState['local']['url']
//     token?: InstancesState['local']['token']
//   }) => {
//     if (!url || !token) {
//       return initialStateLocal
//     }

//     const {
//       body: { id }
//     } = await client({
//       method: 'get',
//       instance: 'remote',
//       instanceUrl: url,
//       endpoint: `accounts/verify_credentials`,
//       headers: { Authorization: `Bearer ${token}` }
//     })

//     const { body: preferences } = await client({
//       method: 'get',
//       instance: 'remote',
//       instanceUrl: url,
//       endpoint: `preferences`,
//       headers: { Authorization: `Bearer ${token}` }
//     })

//     return {
//       url,
//       token,
//       account: {
//         id,
//         preferences
//       }
//     }
//   }
// )

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialState as SettingsState,
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
    }
  }
  // extraReducers: builder => {
  //   builder.addCase(updateLocal.fulfilled, (state, action) => {
  //     state.local = action.payload
  //   })
  // }
})

export const getSettingsLanguage = (state: RootState) => state.settings.language
export const getSettingsTheme = (state: RootState) => state.settings.theme

export const { changeLanguage, changeTheme } = settingsSlice.actions
export default settingsSlice.reducer
