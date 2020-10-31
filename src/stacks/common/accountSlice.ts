import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import client from 'src/api/client'

export const fetch = createAsyncThunk(
  'account/fetch',
  async ({ id }: { id: string }) => {
    const res = await client({
      method: 'get',
      instance: 'local',
      endpoint: `accounts/${id}`
    })
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
  extraReducers: builder => {
    builder.addCase(fetch.pending, state => {
      state.status = 'loading'
    })

    builder.addCase(fetch.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.account = action.payload
    })

    builder.addCase(fetch.rejected, (state, action) => {
      state.status = 'failed'
      console.error(action.error.message)
    })
  }
})

export const { reset } = accountSlice.actions
export default accountSlice.reducer
