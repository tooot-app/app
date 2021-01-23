import { MutationVarsTimelineUpdateStatusProperty } from '@utils/queryHooks/timeline'

const updateNotification = ({
  item,
  payload
}: {
  item: Mastodon.Notification
  payload: MutationVarsTimelineUpdateStatusProperty['payload']
}) => {
  switch (payload.property) {
    case 'poll':
      return item
    default:
      if (item.status) {
        item.status[payload.property] =
          typeof payload.currentValue === 'boolean'
            ? !payload.currentValue
            : true
        if (payload.propertyCount) {
          if (typeof payload.currentValue === 'boolean' && payload.currentValue) {
            item.status[payload.propertyCount] = payload.countValue - 1
          } else {
            item.status[payload.propertyCount] = payload.countValue + 1
          }
        }
      }
      return item
  }
}

export default updateNotification
