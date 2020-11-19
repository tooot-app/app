import { configureStore } from '@reduxjs/toolkit'

import instanceInfoSlice from 'src/stacks/common/instanceInfoSlice'

// get site information from local storage and pass to reducers
const preloadedState = {
  instanceInfo: {
    local: 'social.xmflsct.com',
    localToken: 'qjzJ0IjvZ1apsn0_wBkGcdjKgX7Dao9KEPhGwggPwAo',
    localAccountId: '1',
    localAccount: {
      locked: false
    },
    remote: 'mastodon.social'
  }
}

const reducer = {
  instanceInfo: instanceInfoSlice
}

const store = configureStore({
  preloadedState,
  reducer
})

export default store

export type RootState = ReturnType<typeof store.getState>
