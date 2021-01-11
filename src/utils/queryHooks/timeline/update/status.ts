import { MutationVarsTimelineUpdateStatusProperty } from '@utils/queryHooks/timeline'

const updateStatus = ({
  item,
  reblog,
  payload
}: {
  item: Mastodon.Status
  reblog?: boolean
  payload: MutationVarsTimelineUpdateStatusProperty['payload']
}) => {
  switch (payload.property) {
    case 'poll':
      if (reblog) {
        item.reblog!.poll = payload.data
      } else {
        item.poll = payload.data
      }
      break
    default:
      if (reblog) {
        item.reblog![payload.property] =
          typeof payload.currentValue === 'boolean'
            ? !payload.currentValue
            : true
      } else {
        item[payload.property] =
          typeof payload.currentValue === 'boolean'
            ? !payload.currentValue
            : true
      }
      return item
  }
}

export default updateStatus
