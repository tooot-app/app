import { ContextsV0 } from './v0'
import { ContextsV1 } from './v1'
import { ContextsV2 } from './v2'

const contextsMigration = {
  1: (state: ContextsV0): ContextsV1 => {
    return {
      ...state,
      mePage: {
        lists: { shown: false },
        announcements: { shown: false, unread: 0 }
      }
    }
  },
  2: (state: ContextsV1): ContextsV2 => {
    const { mePage, ...rest } = state
    return rest
  }
}

export default contextsMigration
