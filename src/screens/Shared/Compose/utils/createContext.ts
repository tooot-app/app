import { createContext, Dispatch } from 'react'
import { ComposeAction, ComposeState } from './types'

type ContextType = {
  composeState: ComposeState
  composeDispatch: Dispatch<ComposeAction>
}
const ComposeContext = createContext<ContextType>({} as ContextType)

export default ComposeContext
