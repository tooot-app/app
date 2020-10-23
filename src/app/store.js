import { configureStore } from '@reduxjs/toolkit'

import genericTimelineSlice from 'src/stacks/common/timelineSlice'

export default configureStore({
  reducer: {
    'social.xmflsct.com': genericTimelineSlice('social.xmflsct.com').slice
      .reducer,
    'm.cmx.im': genericTimelineSlice('m.cmx.im').slice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    })
})
