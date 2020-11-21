import { configureStore } from '@reduxjs/toolkit'

import instancesSlice from 'src/utils/slices/instancesSlice'

const store = configureStore({
  reducer: {
    instances: instancesSlice
  }
})

export default store

export type RootState = ReturnType<typeof store.getState>
