import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import client from 'src/api/client'

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
  async (
    { page, paginationDirection, query = {}, account, hashtag, list, toot },
    { getState }
  ) => {
    let res

    if (paginationDirection) {
      const allToots = getState().timelines[page].toots
      switch (paginationDirection) {
        case 'prev':
          query.min_id = allToots[0].id
          break
        case 'next':
          query.max_id = allToots[allToots.length - 1].id
          break
      }
    }

    switch (page) {
      case 'Following':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: 'timelines/home',
          query
        })
        return {
          toots: res.body
        }

      case 'Local':
        query.local = 'true'
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: 'timelines/public',
          query
        })
        return {
          toots: res.body
        }

      case 'LocalPublic':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: 'timelines/public',
          query
        })
        return {
          toots: res.body
        }

      case 'RemotePublic':
        res = await client({
          method: 'get',
          instance: 'remote',
          endpoint: 'timelines/public',
          query
        })
        return {
          toots: res.body
        }

      case 'Notifications':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: 'notifications',
          query
        })
        return {
          toots: res.body
        }

      case 'Account_Default':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: `accounts/${account}/statuses`,
          query: {
            pinned: 'true'
          }
        })
        const toots = res.body
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: `accounts/${account}/statuses`,
          query: {
            exclude_replies: 'true'
          }
        })
        toots.push(...res.body)
        return { toots: toots }

      case 'Account_All':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: `accounts/${account}/statuses`,
          query
        })
        return {
          toots: res.body
        }

      case 'Account_Media':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: `accounts/${account}/statuses`,
          query: {
            only_media: 'true'
          }
        })
        return {
          toots: res.body
        }

      case 'Hashtag':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: `timelines/tag/${hashtag}`,
          query
        })
        return {
          toots: res.body
        }

      case 'List':
        res = await client({
          method: 'get',
          instance: 'local',
          endpoint: `timelines/list/${list}`,
          query
        })
        return {
          toots: res.body
        }

      case 'Toot':
        const current = await client({
          method: 'get',
          instance: 'local',
          endpoint: `statuses/${toot}`
        })
        const context = await client({
          method: 'get',
          instance: 'local',
          endpoint: `statuses/${toot}/context`
        })
        return {
          toots: [...context.ancestors, current, ...context.descendants],
          pointer: context.ancestors.length
        }

      default:
        console.error('First time fetching timeline error')
    }
  }
)

const timelineInitState = {
  toots: [],
  pointer: undefined,
  status: 'idle'
}

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState: {
    Following: timelineInitState,
    Local: timelineInitState,
    LocalPublic: timelineInitState,
    RemotePublic: timelineInitState,
    Notifications: timelineInitState,
    Hashtag: timelineInitState,
    List: timelineInitState,
    Toot: timelineInitState,
    Account_Default: timelineInitState,
    Account_All: timelineInitState,
    Account_Media: timelineInitState
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

      if (action.meta.arg.paginationDirection === 'prev') {
        state[action.meta.arg.page].toots.unshift(...action.payload.toots)
      } else {
        state[action.meta.arg.page].toots.push(...action.payload.toots)
      }

      if (action.payload.pointer) {
        state[action.meta.arg.page].pointer = action.payload.pointer
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
