import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { RootState } from 'src/store'
import client from 'src/api/client'

export type InstancesState = {
  local: {
    url: string | undefined
    token: string | undefined
    account: {
      id: Mastodon.Account['id'] | undefined
      preferences: Mastodon.Preferences
    }
  }
  remote: {
    url: string
  }
}

export const updateLocal = createAsyncThunk(
  'instances/updateLocal',
  async ({
    url,
    token
  }: {
    url: InstancesState['local']['url']
    token: InstancesState['local']['token']
  }) => {
    const {
      body: { id }
    } = await client({
      method: 'get',
      instance: 'remote',
      instanceUrl: url,
      endpoint: `accounts/verify_credentials`,
      headers: { Authorization: `Bearer ${token}` }
    })

    const { body: preferences } = await client({
      method: 'get',
      instance: 'remote',
      instanceUrl: url,
      endpoint: `preferences`,
      headers: { Authorization: `Bearer ${token}` }
    })

    return {
      url,
      token,
      account: {
        id,
        preferences
      }
    }
  }
)

const instancesSlice = createSlice({
  name: 'instances',
  initialState: {
    local: {
      url: undefined,
      token: undefined,
      account: {
        id: undefined,
        preferences: {
          'posting:default:visibility': undefined,
          'posting:default:sensitive': undefined,
          'posting:default:language': undefined,
          'reading:expand:media': undefined,
          'reading:expand:spoilers': undefined
        }
      }
    },
    remote: {
      url: 'mastodon.social'
    }
  } as InstancesState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(updateLocal.fulfilled, (state, action) => {
      state.local = action.payload
    })
  }
})

export const getLocalUrl = (state: RootState) => state.instances.local.url
export const getLocalAccountId = (state: RootState) =>
  state.instances.local.account.id
export const getLocalAccountPreferences = (state: RootState) =>
  state.instances.local.account.preferences

// export const {
//   updateLocalInstance,
//   updateLocalAccount
// } = instancesSlice.actions
export default instancesSlice.reducer
