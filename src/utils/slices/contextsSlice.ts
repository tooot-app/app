import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import * as Updates from 'expo-updates'
import * as StoreReview from 'expo-store-review'

export const supportedLngs = ['zh-Hans', 'en']

export type ContextsState = {
  storeReview: {
    context: Readonly<number>
    current: number
    shown: boolean
  }
  publicRemoteNotice: {
    context: Readonly<number>
    current: number
    hidden: boolean
  }
  previousTab: 'Tab-Local' | 'Tab-Public' | 'Tab-Notifications' | 'Tab-Me'
  mePage: {
    lists: { shown: boolean }
    announcements: { shown: boolean; unread: number }
  }
}

export const contextsInitialState = {
  // After 3 successful postings
  storeReview: {
    context: 3,
    current: 0,
    shown: false
  },
  // After public remote settings has been used once
  publicRemoteNotice: {
    context: 1,
    current: 0,
    hidden: false
  },
  previousTab: 'Tab-Me',
  mePage: {
    lists: { shown: false },
    announcements: { shown: false, unread: 0 }
  }
}

const contextsSlice = createSlice({
  name: 'contexts',
  initialState: contextsInitialState as ContextsState,
  reducers: {
    updateStoreReview: (state, action: PayloadAction<1>) => {
      if (Updates.releaseChannel.includes('release')) {
        state.storeReview.current = state.storeReview.current + action.payload
        if (state.storeReview.current === state.storeReview.context) {
          StoreReview.isAvailableAsync().then(() => StoreReview.requestReview())
        }
      }
    },
    updatePublicRemoteNotice: (state, action: PayloadAction<1>) => {
      state.publicRemoteNotice.current =
        state.publicRemoteNotice.current + action.payload
      if (
        state.publicRemoteNotice.current === state.publicRemoteNotice.context
      ) {
        state.publicRemoteNotice.hidden = true
      }
    },
    updatePreviousTab: (
      state,
      action: PayloadAction<ContextsState['previousTab']>
    ) => {
      state.previousTab = action.payload
    },
    updateContextMePage: (
      state,
      action: PayloadAction<Partial<ContextsState['mePage']>>
    ) => {
      state.mePage = { ...state.mePage, ...action.payload }
    }
  }
})

export const getPublicRemoteNotice = (state: RootState) =>
  state.contexts.publicRemoteNotice
export const getPreviousTab = (state: RootState) => state.contexts.previousTab
export const getMePage = (state: RootState) => state.contexts.mePage
export const getContexts = (state: RootState) => state.contexts

export const {
  updateStoreReview,
  updatePublicRemoteNotice,
  updatePreviousTab,
  updateContextMePage
} = contextsSlice.actions
export default contextsSlice.reducer
