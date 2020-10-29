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

function getPagination (headers, direction) {
  if (!headers) console.error('Missing pagination headers')
  const paginationLinks = headers.get('Link')
  if (paginationLinks) {
    if (direction) {
      return {
        [direction]: paginationLinks.split(
          new RegExp(`<([^>]+)>; rel="${direction}"`)
        )[1]
      }
    } else {
      return {
        prev: paginationLinks.split(new RegExp(/<([^>]+)>; rel="prev"/))[1],
        next: paginationLinks.split(new RegExp(/<([^>]+)>; rel="next"/))[1]
      }
    }
  } else {
    return
  }
}

export const fetch = createAsyncThunk(
  'timeline/fetch',
  async (
    { page, paginationDirection, query = [], account, hashtag, list, toot },
    { getState }
  ) => {
    const instanceLocal = `https://${getState().instanceInfo.local}/api/v1/`
    const instanceRemote = `https://${getState().instanceInfo.remote}/api/v1/`
    // If header if needed for remote server
    const header = {
      headers: {
        Authorization: `Bearer ${getState().instanceInfo.localToken}`
      }
    }

    let res
    // For same page, but only pagination
    if (paginationDirection) {
      res = await client.get(
        getState().timelines[page].pagination[paginationDirection],
        query,
        header
      )
      return {
        toots: res.body,
        pagination: getPagination(res.headers, paginationDirection)
      }
    }

    // For each page's first query
    switch (page) {
      case 'Following':
        res = await client.get(`${instanceLocal}timelines/home`, query, header)
        return {
          toots: res.body,
          pagination: getPagination(res.headers)
        }

      case 'Local':
        query.push({ key: 'local', value: 'true' })
        res = await client.get(
          `${instanceLocal}timelines/public`,
          query,
          header
        )
        return {
          toots: res.body,
          pagination: getPagination(res.headers)
        }

      case 'LocalPublic':
        res = await client.get(
          `${instanceLocal}timelines/public`,
          query,
          header
        )
        return {
          toots: res.body,
          pagination: getPagination(res.headers)
        }

      case 'RemotePublic':
        res = await client.get(`${instanceRemote}timelines/public`, query)
        return {
          toots: res.body,
          pagination: getPagination(res.headers)
        }

      case 'Notifications':
        res = await client.get(`${instanceLocal}notifications`, query, header)
        return {
          toots: res.body,
          pagination: getPagination(res.headers)
        }

      case 'Account_Default':
        res = await client.get(
          `${instanceLocal}accounts/${account}/statuses`,
          [{ key: 'pinned', value: 'true' }],
          header
        )
        const toots = res.body
        res = await client.get(
          `${instanceLocal}accounts/${account}/statuses`,
          [{ key: 'exclude_replies', value: 'true' }],
          header
        )
        toots.push(...res.body)
        return { toots: toots }

      case 'Account_All':
        res = await client.get(
          `${instanceLocal}accounts/${account}/statuses`,
          query,
          header
        )
        return {
          toots: res.body
        }

      case 'Account_Media':
        res = await client.get(
          `${instanceLocal}accounts/${account}/statuses`,
          [{ key: 'only_media', value: 'true' }],
          header
        )
        return {
          toots: res.body
        }

      case 'Hashtag':
        res = await client.get(
          `${instanceLocal}timelines/tag/${hashtag}`,
          query,
          header
        )
        return {
          toots: res.body,
          pagination: getPagination(res.headers)
        }

      case 'List':
        res = await client.get(
          `${instanceLocal}timelines/list/${list}`,
          query,
          header
        )
        return {
          toots: res.body,
          pagination: getPagination(res.headers)
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
        console.error('First time fetching timeline error')
    }
  }
)

const timelineInitState = {
  toots: [],
  pagination: { prev: undefined, next: undefined },
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

      if (action.payload.pagination) {
        state[action.meta.arg.page].pagination = {
          ...state[action.meta.arg.page].pagination,
          ...action.payload.pagination
        }
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
