import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { client } from 'src/api/client'

export const fetch = createAsyncThunk(
  'account/fetch',
  async ({ id }, { getState }) => {
    const instanceLocal = getState().instanceInfo.local + '/api/v1/'

    return await client.get(`${instanceLocal}accounts/${id}`)
  }
)

const accountInitState = {
  account: {},
  status: 'idle'
}

export const getState = state => state.account

export const accountSlice = createSlice({
  name: 'account',
  initialState: {
    account: {},
    status: 'idle'
  },
  reducers: {
    reset: state => {
      state.account = accountInitState
    }
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
