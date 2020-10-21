import { configureStore } from '@reduxjs/toolkit'

import timelineReducer from '../screens/timelineSlice'

export default configureStore({
  reducer: {
    timeline: timelineReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    })
})
