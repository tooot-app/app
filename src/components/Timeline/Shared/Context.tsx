import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { createContext } from 'react'

type ContextType = {
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline

  status?: Mastodon.Status

  isReblog?: boolean
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
