import analytics from '@components/analytics'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { ComposeStateDraft } from '@screens/Compose/utils/types'
import { findIndex } from 'lodash'
import addInstance from './instances/add'
import removeInstance from './instances/remove'
import { updateAccountPreferences } from './instances/updateAccountPreferences'
import { updateInstancePush } from './instances/updatePush'
import { updateInstancePushAlert } from './instances/updatePushAlert'
import { updateInstancePushDecode } from './instances/updatePushDecode'

export const PUSH_SERVER = __DEV__ ? 'testpush.tooot.app' : 'push.tooot.app'

export type Instance = {
  active: boolean
  appData: {
    clientId: string
    clientSecret: string
  }
  url: string
  token: string
  uri: Mastodon.Instance['uri']
  urls: Mastodon.Instance['urls']
  max_toot_chars: number
  account: {
    id: Mastodon.Account['id']
    acct: Mastodon.Account['acct']
    avatarStatic: Mastodon.Account['avatar_static']
    preferences: Mastodon.Preferences
  }
  push:
    | {
        global: { loading: boolean; value: true }
        decode: { loading: boolean; value: boolean }
        alerts: {
          follow: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['follow']
          }
          favourite: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['favourite']
          }
          reblog: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['reblog']
          }
          mention: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['mention']
          }
          poll: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['poll']
          }
        }
        keys: {
          auth: string
          public: string
          private: string
        }
      }
    | {
        global: { loading: boolean; value: false }
        decode: { loading: boolean; value: boolean }
        alerts: {
          follow: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['follow']
          }
          favourite: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['favourite']
          }
          reblog: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['reblog']
          }
          mention: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['mention']
          }
          poll: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['poll']
          }
        }
        keys: undefined
      }
  drafts: ComposeStateDraft[]
}

export type InstancesState = {
  instances: Instance[]
}

export const instancesInitialState: InstancesState = {
  instances: []
}

const findInstanceActive = (state: Instance[]) =>
  state.findIndex(instance => instance.active)

const instancesSlice = createSlice({
  name: 'instances',
  initialState: instancesInitialState,
  reducers: {
    updateInstanceActive: ({ instances }, action: PayloadAction<Instance>) => {
      instances = instances.map(instance => {
        instance.active =
          instance.url === action.payload.url &&
          instance.token === action.payload.token &&
          instance.account.id === action.payload.account.id
        return instance
      })
    },
    updateInstanceAccount: (
      { instances },
      action: PayloadAction<Pick<Instance['account'], 'acct' & 'avatarStatic'>>
    ) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].account = {
        ...instances[activeIndex].account,
        ...action.payload
      }
    },
    updateInstanceDraft: (
      { instances },
      action: PayloadAction<ComposeStateDraft>
    ) => {
      const activeIndex = findInstanceActive(instances)
      const draftIndex = findIndex(instances[activeIndex].drafts, [
        'timestamp',
        action.payload.timestamp
      ])
      if (draftIndex === -1) {
        instances[activeIndex].drafts.unshift(action.payload)
      } else {
        instances[activeIndex].drafts[draftIndex] = action.payload
      }
    },
    removeInstanceDraft: (
      { instances },
      action: PayloadAction<ComposeStateDraft['timestamp']>
    ) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].drafts = instances[activeIndex].drafts?.filter(
        draft => draft.timestamp !== action.payload
      )
    },
    disableAllPushes: ({ instances }) => {
      instances = instances.map(instance => {
        let newInstance = instance
        newInstance.push.global.value = false
        return newInstance
      })
    }
  },
  extraReducers: builder => {
    builder
      .addCase(addInstance.fulfilled, (state, action) => {
        switch (action.payload.type) {
          case 'add':
            state.instances.length &&
              (state.instances = state.instances.map(instance => {
                instance.active = false
                return instance
              }))
            state.instances.push(action.payload.data)
            break
          case 'overwrite':
            state.instances = state.instances.map(instance => {
              if (
                instance.url === action.payload.data.url &&
                instance.account.id === action.payload.data.account.id
              ) {
                return action.payload.data
              } else {
                instance.active = false
                return instance
              }
            })
        }

        analytics('login')
      })
      .addCase(addInstance.rejected, (state, action) => {
        console.error(state.instances)
        console.error(action.error)
      })

      .addCase(removeInstance.fulfilled, (state, action) => {
        state.instances = state.instances.filter(instance => {
          if (
            instance.url === action.payload.url &&
            instance.account.id === action.payload.account.id
          ) {
            return false
          } else {
            return true
          }
        })
        state.instances.length &&
          (state.instances[state.instances.length - 1].active = true)

        analytics('logout')
      })
      .addCase(removeInstance.rejected, (state, action) => {
        console.error(state)
        console.error(action.error)
      })

      // Update Instance Account Preferences
      .addCase(updateAccountPreferences.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].account.preferences = action.payload
      })
      .addCase(updateAccountPreferences.rejected, (_, action) => {
        console.error(action.error)
      })

      // Update Instance Push Global
      .addCase(updateInstancePush.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.global.loading = false
        state.instances[activeIndex].push.global.value = action.meta.arg
        state.instances[activeIndex].push.keys = action.payload
      })
      .addCase(updateInstancePush.rejected, state => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.global.loading = false
      })
      .addCase(updateInstancePush.pending, state => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.global.loading = true
      })

      // Update Instance Push Decode
      .addCase(updateInstancePushDecode.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.decode.loading = false
        state.instances[activeIndex].push.decode.value = action.payload
      })
      .addCase(updateInstancePushDecode.rejected, state => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.decode.loading = false
      })
      .addCase(updateInstancePushDecode.pending, state => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.decode.loading = true
      })

      // Update Instance Push Individual Alert
      .addCase(updateInstancePushAlert.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.alerts[
          action.meta.arg.changed
        ].loading = false
        state.instances[activeIndex].push.alerts = action.payload
      })
      .addCase(updateInstancePushAlert.rejected, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.alerts[
          action.meta.arg.changed
        ].loading = false
      })
      .addCase(updateInstancePushAlert.pending, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.alerts[
          action.meta.arg.changed
        ].loading = true
      })
  }
})

export const getInstanceActive = ({ instances: { instances } }: RootState) =>
  findInstanceActive(instances)

export const getInstances = ({ instances: { instances } }: RootState) =>
  instances

export const getInstance = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive] : null
}

export const getInstanceUrl = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].url : null
}

export const getInstanceUri = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].uri : null
}

export const getInstanceUrls = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].urls : null
}

export const getInstanceMaxTootChar = ({
  instances: { instances }
}: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].max_toot_chars : 500
}

export const getInstanceAccount = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].account : null
}

export const getInstancePush = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].push : null
}

export const getInstanceDrafts = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].drafts : null
}

export const {
  updateInstanceActive,
  updateInstanceAccount,
  updateInstanceDraft,
  removeInstanceDraft,
  disableAllPushes
} = instancesSlice.actions

export default instancesSlice.reducer
