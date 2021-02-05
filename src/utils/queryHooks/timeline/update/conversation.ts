import { MutationVarsTimelineUpdateStatusProperty } from '@utils/queryHooks/timeline'

const updateConversation = ({
  item,
  payload
}: {
  item: Mastodon.Conversation
  payload: MutationVarsTimelineUpdateStatusProperty['payload']
}) => {
  switch (payload.property) {
    case 'poll':
      if (item.last_status) {
        item.last_status[payload.property] = payload.data
      }
      return item
    default:
      if (item.last_status) {
        item.last_status[payload.property] =
          typeof payload.currentValue === 'boolean'
            ? !payload.currentValue
            : true
        if (payload.propertyCount) {
          if (typeof payload.currentValue === 'boolean' && payload.currentValue) {
            item.last_status[payload.propertyCount] = payload.countValue - 1
          } else {
            item.last_status[payload.propertyCount] = payload.countValue + 1
          }
        }
      }
      return item
  }
}

export default updateConversation
