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
      }
      return item
  }
}

export default updateNotification
