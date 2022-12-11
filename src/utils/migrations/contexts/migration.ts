import { ContextsV0 } from './v0'
import { ContextsV1 } from './v1'
import { ContextsV2 } from './v2'
import { ContextsV3 } from './v3'

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
  },
  3: (state: ContextsV2): ContextsV3 => {
    return { ...state, previousSegment: 'Local' }
  }
}

export { ContextsV3 as ContextsLatest }

export default contextsMigration
