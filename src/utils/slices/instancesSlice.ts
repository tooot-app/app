import analytics from '@components/analytics'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { ComposeStateDraft } from '@screens/Compose/utils/types'
import { findIndex } from 'lodash'
import addInstance from './instances/add'
import removeInstance from './instances/remove'
import { updateAccountPreferences } from './instances/updateAccountPreferences'
import { updatePush } from './instances/updatePush'

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
  notification: {
    readTime?: Mastodon.Notification['created_at']
    latestTime?: Mastodon.Notification['created_at']
  }
  push: {
    loading: boolean
    enabled: boolean
    subscription?: Mastodon.PushSubscription
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
    updateInstanceNotification: (
      { instances },
      action: PayloadAction<Partial<Instance['notification']>>
    ) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].notification = {
        ...instances[activeIndex].notification,
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
            console.log('overwriting')
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
        state.instances.splice(action.payload, 1)
        state.instances.length &&
          (state.instances[state.instances.length - 1].active = true)

        analytics('logout')
      })
      .addCase(removeInstance.rejected, (state, action) => {
        console.error(state)
        console.error(action.error)
      })

      .addCase(updateAccountPreferences.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].account.preferences = action.payload
      })
      .addCase(updateAccountPreferences.rejected, (_, action) => {
        console.error(action.error)
      })

      .addCase(updatePush.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        if (typeof action.payload === 'boolean') {
          state.instances[activeIndex].push.enabled = action.payload
        } else {
          state.instances[activeIndex].push.enabled = true
          state.instances[activeIndex].push.subscription = action.payload
        }
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
  return instanceActive !== -1 ? instances[instanceActive].max_toot_chars : null
}

export const getInstanceAccount = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].account : null
}

export const getInstanceNotification = ({
  instances: { instances }
}: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].notification : null
}

export const getInstanceDrafts = ({ instances: { instances } }: RootState) => {
  const instanceActive = findInstanceActive(instances)
  return instanceActive !== -1 ? instances[instanceActive].drafts : null
}

export const {
  updateInstanceActive,
  updateInstanceAccount,
  updateInstanceNotification,
  updateInstanceDraft,
  removeInstanceDraft
} = instancesSlice.actions

export default instancesSlice.reducer
