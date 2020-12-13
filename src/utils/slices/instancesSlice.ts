import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@root/store'
import client from '@api/client'

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

const initialStateLocal = {
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
}

export const updateLocal = createAsyncThunk(
  'instances/updateLocal',
  async ({
    url,
    token
  }: {
    url?: InstancesState['local']['url']
    token?: InstancesState['local']['token']
  }) => {
    if (!url || !token) {
      return initialStateLocal
    }

    const {
      body: { id }
    } = await client({
      method: 'get',
      instance: 'remote',
      instanceDomain: url,
      url: `accounts/verify_credentials`,
      headers: { Authorization: `Bearer ${token}` }
    })

    const { body: preferences } = await client({
      method: 'get',
      instance: 'remote',
      instanceDomain: url,
      url: `preferences`,
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
    local: initialStateLocal,
    remote: {
      url: 'm.cmx.im'
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
export const getLocalToken = (state: RootState) => state.instances.local.token
export const getRemoteUrl = (state: RootState) => state.instances.remote.url
export const getLocalAccountId = (state: RootState) =>
  state.instances.local.account.id
export const getLocalAccountPreferences = (state: RootState) =>
  state.instances.local.account.preferences

export default instancesSlice.reducer
