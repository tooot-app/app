import { ContextsV0 } from './v0'

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
  }
}

export default contextsMigration
