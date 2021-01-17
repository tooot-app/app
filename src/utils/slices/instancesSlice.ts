import client from '@api/client'
import analytics from '@components/analytics'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import * as AuthSession from 'expo-auth-session'
import * as Localization from 'expo-localization'

export type InstanceLocal = {
  appData: {
    clientId: string
    clientSecret: string
  }
  url: string
  token: string
  uri: Mastodon.Instance['uri']
  account: {
    id: Mastodon.Account['id']
    preferences: Mastodon.Preferences
  }
  notification: {
    unread: boolean
    latestTime?: Mastodon.Notification['created_at']
  }
}

export type InstancesState = {
  local: {
    activeIndex: number | null
    instances: InstanceLocal[]
  }

  remote: {
    url: string
  }
}

export const localUpdateAccountPreferences = createAsyncThunk(
  'instances/localUpdateAccountPreferences',
  async (): Promise<Mastodon.Preferences> => {
    const preferences = await client<Mastodon.Preferences>({
      method: 'get',
      instance: 'local',
      url: `preferences`
    })

    return Promise.resolve(preferences)
  }
)

export const localAddInstance = createAsyncThunk(
  'instances/localAddInstance',
  async ({
    url,
    token,
    uri,
    appData
  }: {
    url: InstanceLocal['url']
    token: InstanceLocal['token']
    uri: Mastodon.Instance['uri']
    appData: InstanceLocal['appData']
  }): Promise<{ type: 'add' | 'overwrite'; data: InstanceLocal }> => {
    const { store } = require('@root/store')
    const instanceLocal: InstancesState['local'] = store.getState().instances
      .local

    const { id } = await client<Mastodon.Account>({
      method: 'get',
      instance: 'remote',
      instanceDomain: url,
      url: `accounts/verify_credentials`,
      headers: { Authorization: `Bearer ${token}` }
    })

    let type: 'add' | 'overwrite'
    if (
      instanceLocal.instances.filter(instance => {
        if (instance) {
          if (instance.url === url && instance.account.id === id) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      }).length
    ) {
      type = 'overwrite'
    } else {
      type = 'add'
    }

    const preferences = await client<Mastodon.Preferences>({
      method: 'get',
      instance: 'remote',
      instanceDomain: url,
      url: `preferences`,
      headers: { Authorization: `Bearer ${token}` }
    })

    return Promise.resolve({
      type,
      data: {
        appData,
        url,
        token,
        uri,
        account: {
          id,
          preferences
        },
        notification: {
          unread: false
        }
      }
    })
  }
)
export const localRemoveInstance = createAsyncThunk(
  'instances/localRemoveInstance',
  async (index?: InstancesState['local']['activeIndex']): Promise<number> => {
    const { store } = require('@root/store')
    const instanceLocal: InstancesState['local'] = store.getState().instances
      .local

    if (index) {
      return Promise.resolve(index)
    } else {
      if (instanceLocal.activeIndex !== null) {
        const currentInstance =
          instanceLocal.instances[instanceLocal.activeIndex]

        let revoked = undefined
        try {
          revoked = await AuthSession.revokeAsync(
            {
              clientId: currentInstance.appData.clientId,
              clientSecret: currentInstance.appData.clientSecret,
              token: currentInstance.token,
              scopes: ['read', 'write', 'follow', 'push']
            },
            {
              revocationEndpoint: `https://${currentInstance.url}/oauth/revoke`
            }
          )
        } catch {}

        if (!revoked) {
          console.warn('Revoking error')
        }

        return Promise.resolve(instanceLocal.activeIndex)
      } else {
        throw new Error('Active index invalid, cannot remove instance')
      }
    }
  }
)

export const instancesInitialState: InstancesState = {
  local: {
    activeIndex: null,
    instances: []
  },
  remote: {
    url: Localization.locale.includes('zh') ? 'm.cmx.im' : 'mastodon.social'
  }
}

const instancesSlice = createSlice({
  name: 'instances',
  initialState: instancesInitialState,
  reducers: {
    localUpdateActiveIndex: (
      state,
      action: PayloadAction<NonNullable<InstancesState['local']['activeIndex']>>
    ) => {
      if (action.payload < state.local.instances.length) {
        state.local.activeIndex = action.payload
      } else {
        throw new Error('Set index cannot be found')
      }
    },
    localUpdateNotification: (
      state,
      action: PayloadAction<Partial<InstanceLocal['notification']>>
    ) => {
      state.local.instances[state.local.activeIndex!].notification = {
        ...state.local.instances[state.local.activeIndex!].notification,
        ...action.payload
      }
    },
    remoteUpdate: (
      state,
      action: PayloadAction<InstancesState['remote']['url']>
    ) => {
      state.remote.url = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(localAddInstance.fulfilled, (state, action) => {
        switch (action.payload.type) {
          case 'add':
            state.local.instances.push(action.payload.data)
            state.local.activeIndex = state.local.instances.length - 1
            break
          case 'overwrite':
            state.local.instances = state.local.instances.map(instance => {
              if (
                instance.url === action.payload.data.url &&
                instance.account.id === action.payload.data.account.id
              ) {
                return action.payload.data
              } else {
                return instance
              }
            })
        }

        analytics('login')
      })
      .addCase(localAddInstance.rejected, (state, action) => {
        console.error(state.local)
        console.error(action.error)
      })

      .addCase(localRemoveInstance.fulfilled, (state, action) => {
        state.local.instances.splice(action.payload, 1)
        state.local.activeIndex = state.local.instances.length
          ? state.local.instances.length - 1
          : null

        analytics('logout')
      })
      .addCase(localRemoveInstance.rejected, (state, action) => {
        console.error(state.local)
        console.error(action.error)
      })

      .addCase(localUpdateAccountPreferences.fulfilled, (state, action) => {
        state.local.instances[state.local.activeIndex!].account.preferences =
          action.payload
      })
      .addCase(localUpdateAccountPreferences.rejected, (_, action) => {
        console.error(action.error)
      })
  }
})

export const getLocalActiveIndex = ({ instances: { local } }: RootState) =>
  local.activeIndex
export const getLocalInstances = ({ instances: { local } }: RootState) =>
  local.instances
export const getLocalUrl = ({ instances: { local } }: RootState) =>
  local.activeIndex ? local.instances[local.activeIndex].url : undefined
// export const getLocalToken = ({ instances: { local } }: RootState) =>
//   local && local.activeIndex && local.instances[local.activeIndex].token
export const getLocalAccount = ({ instances: { local } }: RootState) =>
  local.activeIndex !== null
    ? local.instances[local.activeIndex].account
    : undefined
export const getLocalNotification = ({ instances: { local } }: RootState) =>
  local.activeIndex !== null
    ? local.instances[local.activeIndex].notification
    : undefined
export const getRemoteUrl = ({ instances: { remote } }: RootState) => remote.url

export const {
  localUpdateActiveIndex,
  localUpdateNotification,
  remoteUpdate
} = instancesSlice.actions

export default instancesSlice.reducer
