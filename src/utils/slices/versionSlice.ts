import apiGeneral from '@api/general'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import * as Updates from 'expo-updates'

export const retriveVersionLatest = createAsyncThunk(
  'version/latest',
  async () => {
    const res = await apiGeneral<{ latest: string }>({
      method: 'get',
      domain: 'tooot.app',
      url: 'version.json'
    })
    return res.body.latest
  }
)

export type VersionState = {
  update: boolean
}

export const versionInitialState = {
  update: false
}

const versionSlice = createSlice({
  name: 'version',
  initialState: versionInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(retriveVersionLatest.fulfilled, (state, action) => {
      // @ts-ignore
      if (action.payload && Updates.manifest?.version) {
        // @ts-ignore
        if (parseInt(action.payload) > parseInt(Updates.manifest.version)) {
          state.update = true
        }
      }
    })
  }
})

export const getVersionUpdate = (state: RootState) => state.version.update

export default versionSlice.reducer
