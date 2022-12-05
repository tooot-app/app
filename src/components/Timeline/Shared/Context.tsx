import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { createContext } from 'react'

type ContextType = {
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline

  status?: Mastodon.Status

  reblogStatus?: Mastodon.Status // When it is a reblog, pass the root status
  ownAccount?: boolean
  spoilerHidden?: boolean
  copiableContent?: React.MutableRefObject<{
    content: string
    complete: boolean
  }>

  highlighted?: boolean
  disableDetails?: boolean
  disableOnPress?: boolean
}
const StatusContext = createContext<ContextType>({} as ContextType)

export default StatusContext
