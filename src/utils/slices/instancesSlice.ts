import features from '@helpers/features'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { ComposeStateDraft } from '@screens/Compose/utils/types'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import addInstance from './instances/add'
import { checkEmojis } from './instances/checkEmojis'
import removeInstance from './instances/remove'
import { updateAccountPreferences } from './instances/updateAccountPreferences'
import { updateConfiguration } from './instances/updateConfiguration'
import { updateFilters } from './instances/updateFilters'
import { updateInstancePush } from './instances/updatePush'
import { updateInstancePushAlert } from './instances/updatePushAlert'
import { updateInstancePushDecode } from './instances/updatePushDecode'

export type InstancesState = {
  instances: InstanceLatest[]
}

export const instancesInitialState: InstancesState = {
  instances: []
}

const findInstanceActive = (instances: InstanceLatest[]) =>
  instances.findIndex(instance => instance.active)

const instancesSlice = createSlice({
  name: 'instances',
  initialState: instancesInitialState,
  reducers: {
    updateInstanceActive: ({ instances }, action: PayloadAction<InstanceLatest>) => {
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
      action: PayloadAction<Pick<InstanceLatest['account'], 'acct' & 'avatarStatic'>>
    ) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].account = {
        ...instances[activeIndex].account,
        ...action.payload
      }
    },
    updateInstanceNotificationsFilter: (
      { instances },
      action: PayloadAction<InstanceLatest['notifications_filter']>
    ) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].notifications_filter = action.payload
    },
    updateInstanceDraft: ({ instances }, action: PayloadAction<ComposeStateDraft>) => {
      const activeIndex = findInstanceActive(instances)
      const draftIndex = instances[activeIndex].drafts.findIndex(
        ({ timestamp }) => timestamp === action.payload.timestamp
      )
      if (draftIndex === -1) {
        instances[activeIndex].drafts.unshift(action.payload)
      } else {
        instances[activeIndex].drafts[draftIndex] = action.payload
      }
    },
    removeInstanceDraft: ({ instances }, action: PayloadAction<ComposeStateDraft['timestamp']>) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].drafts = instances[activeIndex].drafts?.filter(
        draft => draft.timestamp !== action.payload
      )
    },
    clearPushLoading: ({ instances }) => {
      const activeIndex = findInstanceActive(instances)
    },
    disableAllPushes: ({ instances }) => {
      instances = instances.map(instance => {
        let newInstance = instance
        newInstance.push.global = false
        return newInstance
      })
    },
    updateInstanceFollowingPage: (
      { instances },
      action: PayloadAction<Partial<InstanceLatest['followingPage']>>
    ) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].followingPage = {
        ...instances[activeIndex].followingPage,
        ...action.payload
      }
    },
    updateInstanceMePage: (
      { instances },
      action: PayloadAction<Partial<InstanceLatest['mePage']>>
    ) => {
      const activeIndex = findInstanceActive(instances)
      instances[activeIndex].mePage = {
        ...instances[activeIndex].mePage,
        ...action.payload
      }
    },
    countInstanceEmoji: (
      { instances },
      action: PayloadAction<InstanceLatest['frequentEmojis'][0]['emoji']>
    ) => {
      const HALF_LIFE = 60 * 60 * 24 * 7 // 1 week
      const calculateScore = (emoji: InstanceLatest['frequentEmojis'][0]): number => {
        var seconds = (new Date().getTime() - emoji.lastUsed) / 1000
        var score = emoji.count + 1
        var order = Math.log(Math.max(score, 1)) / Math.LN10
        var sign = score > 0 ? 1 : score === 0 ? 0 : -1
        return (sign * order + seconds / HALF_LIFE) * 10
      }
      const activeIndex = findInstanceActive(instances)
      const foundEmojiIndex = instances[activeIndex].frequentEmojis?.findIndex(
        e => e.emoji.shortcode === action.payload.shortcode && e.emoji.url === action.payload.url
      )
      let newEmojisSort: InstanceLatest['frequentEmojis']
      if (foundEmojiIndex > -1) {
        newEmojisSort = instances[activeIndex].frequentEmojis
          .map((e, i) =>
            i === foundEmojiIndex
              ? {
                  ...e,
                  score: calculateScore(e),
                  count: e.count + 1,
                  lastUsed: new Date().getTime()
                }
              : e
          )
          .sort((a, b) => b.score - a.score)
      } else {
        newEmojisSort = instances[activeIndex].frequentEmojis || []
        const temp = {
          emoji: action.payload,
          score: 0,
          count: 0,
          lastUsed: new Date().getTime()
        }
        newEmojisSort.push({
          ...temp,
          score: calculateScore(temp),
          count: temp.count + 1
        })
      }
      instances[activeIndex].frequentEmojis = newEmojisSort
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
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
        state.instances.length && (state.instances[state.instances.length - 1].active = true)
      })
      .addCase(removeInstance.rejected, (state, action) => {
        console.error(state)
        console.error(action.error)
      })

      // Update Instance Account Filters
      .addCase(updateFilters.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].filters = action.payload
      })
      .addCase(updateFilters.rejected, (_, action) => {
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

      // Update Instance Configuration
      .addCase(updateConfiguration.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].version =
          typeof action.payload.version === 'string' ? action.payload.version : '0'
        state.instances[activeIndex].configuration = action.payload.configuration
      })
      .addCase(updateConfiguration.rejected, (_, action) => {
        console.error(action.error)
      })

      // Update Instance Push Global
      .addCase(updateInstancePush.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.global = action.meta.arg
        state.instances[activeIndex].push.keys = { auth: action.payload }
      })

      // Update Instance Push Decode
      .addCase(updateInstancePushDecode.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.decode = action.payload.disable
      })

      // Update Instance Push Individual Alert
      .addCase(updateInstancePushAlert.fulfilled, (state, action) => {
        const activeIndex = findInstanceActive(state.instances)
        state.instances[activeIndex].push.alerts = action.payload
      })

      // Check if frequently used emojis still exist
      .addCase(checkEmojis.fulfilled, (state, action) => {
        if (!action.payload || !action.payload.length) return
        const activeIndex = findInstanceActive(state.instances)
        if (!Array.isArray(state.instances[activeIndex].frequentEmojis)) {
          state.instances[activeIndex].frequentEmojis = []
        }
        state.instances[activeIndex].frequentEmojis = state.instances[
          activeIndex
        ]?.frequentEmojis?.filter(emoji => {
          return action.payload?.find(
            e => e.shortcode === emoji.emoji.shortcode && e.url === emoji.emoji.url
          )
        })
      })
      .addCase(checkEmojis.rejected, (_, action) => {
        console.error(action.error)
      })
  }
})

export const getInstanceActive = ({ instances: { instances } }: RootState) =>
  findInstanceActive(instances)

export const getInstances = ({ instances: { instances } }: RootState) => instances

export const getInstance = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]

export const getInstanceUrl = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.url

export const getInstanceUri = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.uri.replace(/^https?:\/\//, '') // Pleroma has schema

export const getInstanceUrls = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.urls

export const getInstanceVersion = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.version
export const checkInstanceFeature =
  (feature: string) =>
  ({ instances: { instances } }: RootState): boolean => {
    return (
      features
        .filter(f => f.feature === feature)
        .filter(f => parseFloat(instances[findInstanceActive(instances)]?.version) >= f.version)
        ?.length > 0
    )
  }

/* Get Instance Configuration */
export const getInstanceConfigurationStatusMaxChars = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.configuration?.statuses.max_characters || 500

export const getInstanceConfigurationStatusMaxAttachments = ({
  instances: { instances }
}: RootState) =>
  instances[findInstanceActive(instances)]?.configuration?.statuses.max_media_attachments || 4

export const getInstanceConfigurationStatusCharsURL = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.configuration?.statuses.characters_reserved_per_url ||
  23

export const getInstanceConfigurationMediaAttachments = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.configuration?.media_attachments || {
    supported_mime_types: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/webm',
      'video/mp4',
      'video/quicktime',
      'video/ogg',
      'audio/wave',
      'audio/wav',
      'audio/x-wav',
      'audio/x-pn-wave',
      'audio/ogg',
      'audio/vorbis',
      'audio/mpeg',
      'audio/mp3',
      'audio/webm',
      'audio/flac',
      'audio/aac',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4',
      'audio/3gpp',
      'video/x-ms-asf'
    ],
    image_size_limit: 10485760,
    image_matrix_limit: 16777216,
    video_size_limit: 41943040,
    video_frame_rate_limit: 60,
    video_matrix_limit: 2304000
  }

export const getInstanceConfigurationPoll = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.configuration?.polls || {
    max_options: 4,
    max_characters_per_option: 50,
    min_expiration: 300,
    max_expiration: 2629746
  }
/* END */

export const getInstanceAccount = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.account

export const getInstanceNotificationsFilter = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.notifications_filter

export const getInstancePush = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.push

export const getInstanceFollowingPage = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.followingPage

export const getInstanceMePage = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.mePage

export const getInstanceDrafts = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.drafts

export const getInstanceFrequentEmojis = ({ instances: { instances } }: RootState) =>
  instances[findInstanceActive(instances)]?.frequentEmojis

export const {
  updateInstanceActive,
  updateInstanceAccount,
  updateInstanceNotificationsFilter,
  updateInstanceDraft,
  removeInstanceDraft,
  disableAllPushes,
  updateInstanceFollowingPage,
  updateInstanceMePage,
  countInstanceEmoji
} = instancesSlice.actions

export default instancesSlice.reducer
