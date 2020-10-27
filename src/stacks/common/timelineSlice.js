import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { client } from 'src/api/client'

// Naming convention
// Following:     timelines/home
// Local:         timelines/public/local
// LocalPublic:   timelines/public
// RemotePublic:  remote/timelines/public
// Notifications: notifications
// Hashtag:       hastag
// List:          list

export const fetch = createAsyncThunk(
  'timeline/fetch',
  async ({ page, query = [], hashtag, list }, { getState }) => {
    const instanceLocal = getState().instanceInfo.local + '/api/v1/'
    const instanceRemote = getState().instanceInfo.remote + '/api/v1/'
    const header = {
      headers: {
        Authorization: `Bearer ${getState().instanceInfo.localToken}`
      }
    }

    switch (page) {
      case 'Following':
        return await client.get(`${instanceLocal}timelines/home`, query, header)
      case 'Local':
        query.push({ key: 'local', value: 'true' })
        return await client.get(
          `${instanceLocal}timelines/public`,
          query,
          header
        )
      case 'LocalPublic':
        return await client.get(
          `${instanceLocal}timelines/public`,
          query,
          header
        )
      case 'RemotePublic':
        return await client.get(`${instanceRemote}timelines/public`, query)
      case 'Notifications':
        return await client.get(`${instanceLocal}notifications`, query, header)
      case 'Hashtag':
        return await client.get(
          `${instanceLocal}timelines/tag/${hashtag}`,
          query,
          header
        )
      case 'List':
        return await client.get(
          `${instanceLocal}timelines/list/${list}`,
          query,
          header
        )
      default:
        console.error('Timeline type error')
    }
  }
)

const timelineInitState = {
  toots: [],
  status: 'idle'
}

export const getState = state => page => state.timelines[page]

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    Following: timelineInitState,
    Local: timelineInitState,
    LocalPublic: timelineInitState,
    RemotePublic: timelineInitState,
    Notifications: timelineInitState,
    Hashtag: timelineInitState,
    List: timelineInitState
  },
  reducers: {
    reset (state, action) {
      state[action.payload] = timelineInitState
    }
  },
  extraReducers: {
    [fetch.pending]: (state, action) => {
      state[action.meta.arg.page].status = 'loading'
    },
    [fetch.fulfilled]: (state, action) => {
      state[action.meta.arg.page].status = 'succeeded'
      if (action.meta.arg.query && action.meta.arg.query.since_id) {
        state[action.meta.arg.page].toots.unshift(...action.payload)
      } else {
        state[action.meta.arg.page].toots.push(...action.payload)
      }
    },
    [fetch.rejected]: (state, action) => {
      state[action.meta.arg.page].status = 'failed'
      console.error(action.error.message)
    }
  }
})

export const { reset } = timelineSlice.actions
export default timelineSlice.reducer
