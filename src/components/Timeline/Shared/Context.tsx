import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { createContext } from 'react'

export type HighlightedStatusContextType = {}

type StatusContextType = {
  queryKey?: QueryKeyTimeline

  status?: Mastodon.Status

  ownAccount?: boolean
  spoilerHidden?: boolean
  rawContent?: React.MutableRefObject<string[]> // When highlighted, for translate, edit history
  detectedLanguage?: React.MutableRefObject<string>
  excludeMentions?: React.MutableRefObject<Mastodon.Mention[]>

  highlighted?: boolean
  inThread?: boolean
  disableDetails?: boolean
  disableOnPress?: boolean
  isConversation?: boolean
  isRemote?: boolean
}
const StatusContext = createContext<StatusContextType>({} as StatusContextType)

export default StatusContext
