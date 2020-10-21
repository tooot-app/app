import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchNewer = createAsyncThunk('timeline/fetchNewer', async id => {
  let data
  try {
    const response = await fetch(
      `https://m.cmx.im/api/v1/timelines/public?since_id=${id}`
    )
    data = await response.json()
    if (response.ok) {
      return data
    }
    throw new Error(response.statusText)
  } catch (err) {
    return Promise.reject(err.message ? err.message : data)
  }
})

export const fetchOlder = createAsyncThunk('timeline/fetchOlder', async id => {
  let data
  try {
    const response = await fetch(
      `https://m.cmx.im/api/v1/timelines/public${id ? `?max_id=${id}` : ''}`
    )
    data = await response.json()
    if (response.ok) {
      return data
    }
    throw new Error(response.statusText)
  } catch (err) {
    return Promise.reject(err.message ? err.message : data)
  }
})

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    toots: [],
    status: 'idle',
    error: null
  },
  extraReducers: {
    [fetchNewer.pending]: (state, action) => {
      state.status = 'loading'
    },
    [fetchNewer.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      state.toots.unshift(...action.payload)
    },
    [fetchNewer.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    },
    [fetchOlder.pending]: (state, action) => {
      state.status = 'loading'
    },
    [fetchOlder.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      state.toots.push(...action.payload)
    },
    [fetchOlder.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    }
  }
})

// export const { update } = timelineSlice.actions

export const allToots = state => state.timeline.toots

export default timelineSlice.reducer
