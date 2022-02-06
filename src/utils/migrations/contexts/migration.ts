import { ContextsV0 } from './v0'
import { ContextsV1 } from './v1'

const contextsMigration = {
  1: (state: ContextsV0) => {
    return (state = {
      ...state,
      // @ts-ignore
      mePage: {
        lists: { shown: false },
        announcements: { shown: false, unread: 0 }
      }
    })
  },
  2: (state: ContextsV1) => {
    // @ts-ignore
    delete state.mePage
    return state
  }
}

export default contextsMigration
