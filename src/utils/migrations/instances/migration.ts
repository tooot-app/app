import { InstanceV3 } from './v3'
import { InstanceV4 } from './v4'

const instancesMigration = {
  4: (state: InstanceV3) => {
    return {
      instances: state.local.instances.map((instance, index) => {
        // @ts-ignore
        delete instance.notification
        return {
          ...instance,
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
  5: (state: InstanceV4) => {
    // Migration is run on each start, don't know why
    // @ts-ignore
    if (state.instances.length && !state.instances[0].notifications_filter) {
      return {
        instances: state.instances.map(instance => {
          // @ts-ignore
          instance.notifications_filter = {
            follow: true,
            favourite: true,
            reblog: true,
            mention: true,
            poll: true,
            follow_request: true
          }
          return instance
        })
      }
    } else {
      return state
    }
  }
}

export default instancesMigration
