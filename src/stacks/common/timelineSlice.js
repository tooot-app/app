import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { client } from 'src/api/client'
import * as localStorage from 'src/utils/localStorage'

export default function genericTimelineSlice (instance) {
  const fetch = createAsyncThunk(
    'timeline/fetch',
    async ({ endpoint, local, id, newer }) => {
      if (!instance || !endpoint) console.error('Missing instance or endpoint.')

      let query = {}
      if (local) query.local = 'true'
      if (newer) {
        query.since_id = id
      } else {
        if (id) {
          query.max_id = id
        }
      }

      let header
      const instanceToken = await localStorage.getItem()
      if (instanceToken) {
        header = { headers: { Authorization: `Bearer ${instanceToken}` } }
      }

      return {
        data: await client.get(
          instance,
          `timelines/${endpoint}`,
          query,
          header
        ),
        newer: newer
      }
    }
  )

  const slice = createSlice({
    name: instance,
    initialState: {
      toots: [],
      status: 'idle',
      error: null
    },
    extraReducers: {
      [fetch.pending]: state => {
        state.status = 'loading'
      },
      [fetch.fulfilled]: (state, action) => {
        state.status = 'succeeded'
        action.payload.newer
          ? state.toots.unshift(...action.payload.data)
          : state.toots.push(...action.payload.data)
      },
      [fetch.rejected]: (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      }
    }
  })

  getToots = state => state[instance].toots
  getStatus = state => state[instance].status

  return {
    fetch,
    slice,
    getToots,
    getStatus
  }
}

// export const timelineSlice = genericTimelineSlice(data)

// export default timelineSlice.reducer
