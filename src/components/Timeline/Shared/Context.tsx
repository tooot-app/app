import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { createContext } from 'react'

export type HighlightedStatusContextType = {}

type StatusContextType = {
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline

  status?: Mastodon.Status

  reblogStatus?: Mastodon.Status // When it is a reblog, pass the root status
  ownAccount?: boolean
  spoilerHidden?: boolean
  rawContent?: React.MutableRefObject<string[]> // When highlighted, for translate, edit history
  detectedLanguage?: React.MutableRefObject<string>

  highlighted?: boolean
  inThread?: boolean
  disableDetails?: boolean
  disableOnPress?: boolean
  isConversation?: boolean
}
const StatusContext = createContext<StatusContextType>({} as StatusContextType)

export default StatusContext
