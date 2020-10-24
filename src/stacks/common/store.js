import { configureStore } from '@reduxjs/toolkit'

import instanceInfoSlice from 'src/stacks/common/instanceInfoSlice'
import timelineSlice from 'src/stacks/common/timelineSlice'

// get site information from local storage and pass to reducers
const preloadedState = {
  instanceInfo: {
    current: 'social.xmflsct.com',
    currentToken: 'qjzJ0IjvZ1apsn0_wBkGcdjKgX7Dao9KEPhGwggPwAo',
    remote: 'mastodon.social'
  }
}

const reducer = {
  instanceInfo: instanceInfoSlice,
  timelines: timelineSlice
}

export default configureStore({
  preloadedState,
  reducer
})
