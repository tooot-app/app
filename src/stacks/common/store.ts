import { configureStore } from '@reduxjs/toolkit'

import instanceInfoSlice from 'src/stacks/common/instanceInfoSlice'
import timelineSlice from 'src/stacks/common/timelineSlice'
import accountSlice from 'src/stacks/common/accountSlice'
// import relationshipsSlice from 'src/stacks/common/relationshipsSlice'

// get site information from local storage and pass to reducers
const preloadedState = {
  instanceInfo: {
    local: 'social.xmflsct.com',
    localToken: 'qjzJ0IjvZ1apsn0_wBkGcdjKgX7Dao9KEPhGwggPwAo',
    remote: 'mastodon.social'
  }
}

const reducer = {
  instanceInfo: instanceInfoSlice,
  timelines: timelineSlice,
  account: accountSlice,
  // relationships: relationshipsSlice
}

const store = configureStore({
  preloadedState,
  reducer
})

export default store

export type RootState = ReturnType<typeof store.getState>
