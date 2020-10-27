import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { client } from 'src/api/client'

export const fetch = createAsyncThunk(
  'relationships/fetch',
  async ({ ids }, { getState }) => {
    if (!ids.length) console.error('Relationships empty')
    const instanceLocal = getState().instanceInfo.local + '/api/v1/'
    const query = ids.map(id => ({
      key: 'id[]',
      value: id
    }))
    const header = {
      headers: {
        Authorization: `Bearer ${getState().instanceInfo.localToken}`
      }
    }

    return await client.get(
      `${instanceLocal}accounts/relationships`,
      query,
      header
    )
  }
)

const relationshipsInitState = {
  relationships: [],
  status: 'idle'
}

export const retrive = state => state.relationships

export const relationshipSlice = createSlice({
  name: 'relationships',
  initialState: {
    relationships: [],
    status: 'idle'
  },
  reducers: {
    reset: () => relationshipsInitState
  },
  extraReducers: {
    [fetch.pending]: state => {
      state.status = 'loading'
    },
    [fetch.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      state.relationships = action.payload
    },
    [fetch.rejected]: (state, action) => {
      state.status = 'failed'
      console.error(action.error.message)
    }
  }
})

export const { reset } = relationshipSlice.actions
export default relationshipSlice.reducer
