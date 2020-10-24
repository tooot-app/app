import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { client } from 'src/api/client'

// Naming convention
// Following:     home
// Local:         home/local
// CurrentPublic: public/local
// RemotePublic:  remote

const checkInstance = ({ remote, endpoint, local }) =>
  remote ? 'remote' : `${endpoint}${local ? '/local' : ''}`

export const fetch = createAsyncThunk(
  'timeline/fetch',
  async ({ remote, endpoint, local, id, newer }, { getState }) => {
    if (!endpoint) console.error('Missing endpoint')

    const instance = remote
      ? `${getState().instanceInfo.remote}/api/v1/timelines/public`
      : `${getState().instanceInfo.current}/api/v1/timelines/${endpoint}`

    const query = {
      ...(local && { local: 'true' }),
      ...(newer ? { since_id: id } : id && { max_id: id })
    }

    const header = {
      ...(getState().instanceInfo.currentToken && {
        headers: {
          Authorization: `Bearer ${getState().instanceInfo.currentToken}`
        }
      })
    }

    return await client.get(instance, query, header)
  }
)

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    home: {
      toots: [],
      status: 'idle'
    },
    'home/local': {
      toots: [],
      status: 'idle'
    },
    'public/local': {
      toots: [],
      status: 'idle'
    },
    remote: {
      toots: [],
      status: 'idle'
    }
  },
  extraReducers: {
    [fetch.pending]: (state, action) => {
      state[checkInstance(action.meta.arg)].status = 'loading'
    },
    [fetch.fulfilled]: (state, action) => {
      state[checkInstance(action.meta.arg)].status = 'succeeded'
      action.meta.arg.newer
        ? state[checkInstance(action.meta.arg)].toots.unshift(...action.payload)
        : state[checkInstance(action.meta.arg)].toots.push(...action.payload)
    },
    [fetch.rejected]: (state, action) => {
      console.error(action.error.message)
      state[checkInstance(action.meta.arg)].status = 'failed'
    }
  }
})

export const getToots = state => instance =>
  state.timelines[checkInstance(instance)].toots
export const getStatus = state => instance =>
  state.timelines[checkInstance(instance)].status

export default timelineSlice.reducer
