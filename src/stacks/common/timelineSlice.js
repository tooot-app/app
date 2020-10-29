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
  async ({ page, query = [], account, hashtag, list, toot }, { getState }) => {
    const instanceLocal = getState().instanceInfo.local + '/api/v1/'
    const instanceRemote = getState().instanceInfo.remote + '/api/v1/'
    // If header if needed for remote server
    const header = {
      headers: {
        Authorization: `Bearer ${getState().instanceInfo.localToken}`
      }
    }

    switch (page) {
      case 'Following':
        return {
          toots: await client.get(
            `${instanceLocal}timelines/home`,
            query,
            header
          )
        }
      case 'Local':
        query.push({ key: 'local', value: 'true' })
        return {
          toots: await client.get(
            `${instanceLocal}timelines/public`,
            query,
            header
          )
        }
      case 'LocalPublic':
        return {
          toots: await client.get(
            `${instanceLocal}timelines/public`,
            query,
            header
          )
        }
      case 'RemotePublic':
        return {
          toots: await client.get(`${instanceRemote}timelines/public`, query)
        }
      case 'Notifications':
        return {
          toots: await client.get(
            `${instanceLocal}notifications`,
            query,
            header
          )
        }
      case 'Account_Default':
        const toots = await client.get(
          `${instanceLocal}accounts/${account}/statuses`,
          [{ key: 'pinned', value: 'true' }],
          header
        )
        toots.push(
          ...(await client.get(
            `${instanceLocal}accounts/${account}/statuses`,
            [{ key: 'exclude_replies', value: 'true' }],
            header
          ))
        )
        return { toots: toots }
      case 'Account_All':
        return {
          toots: await client.get(
            `${instanceLocal}accounts/${account}/statuses`,
            query,
            header
          )
        }
      case 'Account_Media':
        return {
          toots: await client.get(
            `${instanceLocal}accounts/${account}/statuses`,
            [{ key: 'only_media', value: 'true' }],
            header
          )
        }
      case 'Hashtag':
        return {
          toots: await client.get(
            `${instanceLocal}timelines/tag/${hashtag}`,
            query,
            header
          )
        }
      case 'List':
        return {
          toots: await client.get(
            `${instanceLocal}timelines/list/${list}`,
            query,
            header
          )
        }
      case 'Toot':
        const current = await client.get(
          `${instanceLocal}statuses/${toot}`,
          [],
          header
        )
        const context = await client.get(
          `${instanceLocal}statuses/${toot}/context`,
          [],
          header
        )
        return {
          toots: [...context.ancestors, current, ...context.descendants],
          pointer: context.ancestors.length
        }
      default:
        console.error('Timeline type error')
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
      if (
        action.meta.arg.query &&
        action.meta.arg.query[0].key === 'since_id'
      ) {
        state[action.meta.arg.page].toots.unshift(...action.payload.toots)
      } else {
        state[action.meta.arg.page].toots.push(...action.payload.toots)
      }
      state[action.meta.arg.page].pointer = action.payload.pointer
    },
    [fetch.rejected]: (state, action) => {
      state[action.meta.arg.page].status = 'failed'
      console.error(action.error.message)
    }
  }
})

export const { reset } = timelineSlice.actions
export default timelineSlice.reducer
