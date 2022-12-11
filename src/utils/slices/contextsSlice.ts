import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { ContextsLatest } from '@utils/migrations/contexts/migration'
import Constants from 'expo-constants'
import * as StoreReview from 'expo-store-review'

export const contextsInitialState: ContextsLatest = {
  // After 10 successful postings
  storeReview: {
    context: 10,
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
  previousSegment: 'Local'
}

const contextsSlice = createSlice({
  name: 'contexts',
  initialState: contextsInitialState,
  reducers: {
    updateStoreReview: (state, action: PayloadAction<1>) => {
      if (Constants.expoConfig?.extra?.environment === 'release') {
        state.storeReview.current = state.storeReview.current + action.payload
        if (state.storeReview.current === state.storeReview.context) {
          StoreReview?.isAvailableAsync().then(() => StoreReview.requestReview())
        }
      }
    },
    updatePublicRemoteNotice: (state, action: PayloadAction<1>) => {
      state.publicRemoteNotice.current = state.publicRemoteNotice.current + action.payload
      if (state.publicRemoteNotice.current === state.publicRemoteNotice.context) {
        state.publicRemoteNotice.hidden = true
      }
    },
    updatePreviousTab: (state, action: PayloadAction<ContextsLatest['previousTab']>) => {
      state.previousTab = action.payload
    },
    updatePreviousSegment: (state, action: PayloadAction<ContextsLatest['previousSegment']>) => {
      state.previousSegment = action.payload
    }
  }
})

export const getPublicRemoteNotice = (state: RootState) => state.contexts.publicRemoteNotice
export const getPreviousTab = (state: RootState) => state.contexts.previousTab
export const getPreviousSegment = (state: RootState) => state.contexts.previousSegment
export const getContexts = (state: RootState) => state.contexts

export const {
  updateStoreReview,
  updatePublicRemoteNotice,
  updatePreviousTab,
  updatePreviousSegment
} = contextsSlice.actions
export default contextsSlice.reducer
