import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit'
import store from 'src'

import client from 'src/api/client'

export const fetch = createAsyncThunk(
  'timeline/fetch',
  async (
    {
      page,
      paginationDirection,
      query = {},
      account,
      hashtag,
      list,
      toot
    }: {
      page: string
      paginationDirection?: 'prev' | 'next'
      query?: {
        [key: string]: string | number | boolean
      }
      account?: string
      hashtag?: string
      list?: string
      toot?: string
    },
    { getState }
  ) => {
    let res

    if (paginationDirection) {
      //@ts-ignore
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

const timelineInitState: store.TimelineState = {
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
    reset (state, action: PayloadAction<store.TimelinePage>) {
      //@ts-ignore
      state[action.payload] = timelineInitState
    },
    updateStatus (state, action) {
      Object.keys(state).map((page: store.TimelinePage) => {
        //@ts-ignore
        const index: number = state[page].toots.findIndex(
          (toot: mastodon.Status) => toot.id === action.payload.id
        )
        if (index !== -1) {
          //@ts-ignore
          state[page].toots[index] = action.payload
        }
      })
    }
  },
  extraReducers: builder => {
    builder.addCase(fetch.pending, (state, action: AnyAction) => {
      //@ts-ignore
      state[action.meta.arg.page].status = 'loading'
    })

    builder.addCase(fetch.fulfilled, (state, action) => {
      //@ts-ignore
      state[action.meta.arg.page].status = 'succeeded'

      if (action.payload?.toots) {
        if (action.meta.arg.paginationDirection === 'prev') {
          //@ts-ignore
          state[action.meta.arg.page].toots.unshift(...action.payload.toots)
        } else {
          //@ts-ignore
          state[action.meta.arg.page].toots.push(...action.payload.toots)
        }
      }

      if (action.payload?.pointer) {
        //@ts-ignore
        state[action.meta.arg.page].pointer = action.payload.pointer
      }
    })

    builder.addCase(fetch.rejected, (state, action) => {
      //@ts-ignore
      state[action.meta.arg.page].status = 'failed'
      console.error(action.error.message)
    })
  }
})

export const { reset, updateStatus } = timelineSlice.actions
export default timelineSlice.reducer
