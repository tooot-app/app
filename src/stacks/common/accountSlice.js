import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { client } from 'src/api/client'

export const fetch = createAsyncThunk(
  'account/fetch',
  async ({ id }, { getState }) => {
    const instanceLocal = `https://${getState().instanceInfo.local}/api/v1/`
    const res = await client.get(`${instanceLocal}accounts/${id}`)
    return res.body
  }
)

const accountInitState = {
  account: {},
  status: 'idle'
}

export const accountSlice = createSlice({
  name: 'account',
  initialState: accountInitState,
  reducers: {
    reset: () => accountInitState
  },
  extraReducers: {
    [fetch.pending]: state => {
      state.status = 'loading'
    },
    [fetch.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      state.account = action.payload
    },
    [fetch.rejected]: (state, action) => {
      state.status = 'failed'
      console.error(action.error.message)
    }
  }
})

export const { reset } = accountSlice.actions
export default accountSlice.reducer
