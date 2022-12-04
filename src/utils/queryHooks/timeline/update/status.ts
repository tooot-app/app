import { MutationVarsTimelineUpdateStatusProperty } from '@utils/queryHooks/timeline'

const updateStatus = ({
  item,
  isReblog,
  payload
}: {
  item: Mastodon.Status
  isReblog?: boolean
  payload: MutationVarsTimelineUpdateStatusProperty['payload']
}) => {
  switch (payload.property) {
    case 'poll':
      if (isReblog) {
        item.reblog!.poll = payload.data
      } else {
        item.poll = payload.data
      }
      break
    default:
      if (isReblog) {
        item.reblog![payload.property] =
          typeof payload.currentValue === 'boolean' ? !payload.currentValue : true
        if (payload.propertyCount) {
          if (typeof payload.currentValue === 'boolean' && payload.currentValue) {
            item.reblog![payload.propertyCount] = payload.countValue - 1
          } else {
            item.reblog![payload.propertyCount] = payload.countValue + 1
          }
        }
      } else {
        item[payload.property] =
          typeof payload.currentValue === 'boolean' ? !payload.currentValue : true
        if (payload.propertyCount) {
          if (typeof payload.currentValue === 'boolean' && payload.currentValue) {
            item[payload.propertyCount] = payload.countValue - 1
          } else {
            item[payload.propertyCount] = payload.countValue + 1
          }
        }
      }
      return item
  }
}

export default updateStatus
