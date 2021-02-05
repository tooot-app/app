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
  }
}

const contextsSlice = createSlice({
  name: 'settings',
  initialState: contextsInitialState as ContextsState,
  reducers: {
    updateStoreReview: (state, action: PayloadAction<1>) => {
      if (Updates.releaseChannel.includes('production')) {
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
    }
  }
})

export const getPublicRemoteNotice = (state: RootState) =>
  state.contexts.publicRemoteNotice

export const {
  updateStoreReview,
  updatePublicRemoteNotice
} = contextsSlice.actions
export default contextsSlice.reducer
