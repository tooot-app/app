import { createContext, Dispatch, MutableRefObject, RefObject } from 'react'
import { TextInput } from 'react-native'

type inputProps = {
  value: [string, (value: string) => void]
  selection: [{ start: number; end?: number }, (selection: { start: number; end?: number }) => void]
  isFocused: MutableRefObject<boolean>
  ref?: RefObject<TextInput> // For controlling focus
  maxLength?: number
  addFunc?: (add: string) => void // For none default state update
}

export type Emojis = MutableRefObject<
  | {
      title: string
      data: Pick<Mastodon.Emoji, 'shortcode' | 'url' | 'static_url'>[][]
      type?: 'frequent'
    }[]
  | null
>

export type EmojisState = {
  inputProps: inputProps[]
  targetIndex: number
}

export type EmojisAction =
  | { type: 'input'; payload: EmojisState['inputProps'] }
  | { type: 'target'; payload: EmojisState['targetIndex'] }

type ContextType = {
  emojisState: EmojisState
  emojisDispatch: Dispatch<EmojisAction>
}
const EmojisContext = createContext<ContextType>({} as ContextType)

export const emojisReducer = (state: EmojisState, action: EmojisAction) => {
  switch (action.type) {
    case 'input':
      return { ...state, inputProps: action.payload }
    case 'target':
      return { ...state, targetIndex: action.payload }
  }
}

export default EmojisContext
