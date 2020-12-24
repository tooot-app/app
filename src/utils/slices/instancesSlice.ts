import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

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
    notification: {
      unread: boolean
      latestTime?: Mastodon.Notification['created_at']
    }
  }
  remote: {
    url: string
  }
}

const initialStateLocal: InstancesState['local'] = {
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
  },
  notification: {
    unread: false,
    latestTime: undefined
  }
}

export const updateLocalAccountPreferences = createAsyncThunk(
  'instances/updateLocalAccountPreferences',
  async () => {
    const { body: preferences } = await client({
      method: 'get',
      instance: 'local',
      url: `preferences`
    })

    return preferences as Mastodon.Preferences
  }
)

export const loginLocal = createAsyncThunk(
  'instances/loginLocal',
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
    } as InstancesState['local']
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
  reducers: {
    resetLocal: state => {
      state.local = initialStateLocal
    },
    updateNotification: (
      state,
      action: PayloadAction<Partial<InstancesState['local']['notification']>>
    ) => {
      state.local.notification = {
        ...state.local.notification,
        ...action.payload
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginLocal.fulfilled, (state, action) => {
        state.local = action.payload
      })
      .addCase(updateLocalAccountPreferences.fulfilled, (state, action) => {
        state.local.account.preferences = action.payload
      })
  }
})

export const getLocalUrl = (state: RootState) => state.instances.local.url
export const getLocalToken = (state: RootState) => state.instances.local.token
export const getLocalNotification = (state: RootState) =>
  state.instances.local.notification
export const getRemoteUrl = (state: RootState) => state.instances.remote.url
export const getLocalAccountId = (state: RootState) =>
  state.instances.local.account.id
export const getLocalAccountPreferences = (state: RootState) =>
  state.instances.local.account.preferences

export const { resetLocal, updateNotification } = instancesSlice.actions

export default instancesSlice.reducer
