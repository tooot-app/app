import { configureStore } from '@reduxjs/toolkit'

import instanceInfoSlice from 'src/stacks/common/instanceInfoSlice'
import timelineSlice from 'src/stacks/common/timelineSlice'

// get site information from local storage and pass to reducers
const preloadedState = {
  instanceInfo: {
    current: 'm.cmx.im',
    currentToken: 'Cxx19XX2VNHnPy_dr_HCHMh4HvwHEvYwWrrU3r3BNzQ',
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
