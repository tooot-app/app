import { InstanceV3 } from './v3'
import { InstanceV4 } from './v4'
import { InstanceV5 } from './v5'
import { InstanceV6 } from './v6'
import { InstanceV7 } from './v7'
import { InstanceV8 } from './v8'
import { InstanceV9 } from './v9'
import { InstanceV10 } from './v10'

const instancesMigration = {
  4: (state: InstanceV3): InstanceV4 => {
    return {
      instances: state.local.instances.map((instance, index) => {
        const { notification, ...rest } = instance
        return {
          ...rest,
          active: state.local.activeIndex === index,
          push: {
            global: { loading: false, value: false },
            decode: { loading: false, value: false },
            alerts: {
              follow: { loading: false, value: true },
              favourite: { loading: false, value: true },
              reblog: { loading: false, value: true },
              mention: { loading: false, value: true },
              poll: { loading: false, value: true }
            },
            keys: undefined
          }
        }
      })
    }
  },
  5: (state: InstanceV4): InstanceV5 => {
    // @ts-ignore
    if (state.instances.length && !state.instances[0].notifications_filter) {
      return {
        // @ts-ignore
        instances: state.instances.map(instance => {
          return {
            ...instance,
            notifications_filter: {
              follow: true,
              favourite: true,
              reblog: true,
              mention: true,
              poll: true,
              follow_request: true
            }
          }
        })
      }
    } else {
      // @ts-ignore
      return state
    }
  },
  6: (state: InstanceV5): InstanceV6 => {
    return {
      // @ts-ignore
      instances: state.instances.map(instance => {
        return {
          ...instance,
          configuration: undefined
        }
      })
    }
  },
  7: (state: InstanceV6): InstanceV7 => {
    return {
      instances: state.instances.map(instance => {
        return {
          ...instance,
          timelinesLookback: {},
          mePage: {
            lists: { shown: false },
            announcements: { shown: false, unread: 0 }
          }
        }
      })
    }
  },
  8: (state: InstanceV7): InstanceV8 => {
    return {
      instances: state.instances.map(instance => {
        return {
          ...instance,
          frequentEmojis: []
        }
      })
    }
  },
  9: (state: InstanceV8): { instances: InstanceV9[] } => {
    return {
      // @ts-ignore
      instances: state.instances.map(instance => {
        return {
          ...instance,
          version: '0'
        }
      })
    }
  },
  10: (state: { instances: InstanceV9[] }): { instances: InstanceV10[] } => {
    return {
      instances: state.instances.map(instance => {
        return {
          ...instance,
          notifications_filter: {
            ...instance.notifications_filter,
            status: true,
            update: true
          }
        }
      })
    }
  }
}

export { InstanceV10 as InstanceLatest }

export default instancesMigration
