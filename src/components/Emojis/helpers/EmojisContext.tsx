import { createContext, Dispatch, RefObject, SetStateAction } from 'react'
import { TextInput } from 'react-native'

type inputProps = {
  ref: RefObject<TextInput>
  value: string
  setValue: Dispatch<SetStateAction<string>>
  selectionRange?: { start: number; end: number }
  maxLength?: number
}

export type EmojisState = {
  emojis: {
    title: string
    data: Pick<Mastodon.Emoji, 'shortcode' | 'url' | 'static_url'>[][]
  }[]
  targetProps: inputProps | null
  inputProps: inputProps[]
}

export type EmojisAction =
  | { type: 'load'; payload: NonNullable<EmojisState['emojis']> }
  | { type: 'target'; payload: EmojisState['targetProps'] }
  | { type: 'input'; payload: EmojisState['inputProps'] }

type ContextType = {
  emojisState: EmojisState
  emojisDispatch: Dispatch<EmojisAction>
}
const EmojisContext = createContext<ContextType>({} as ContextType)

export const emojisReducer = (state: EmojisState, action: EmojisAction) => {
  switch (action.type) {
    case 'load':
      return { ...state, emojis: action.payload }
    case 'target':
      return { ...state, targetProps: action.payload }
    case 'input':
      return { ...state, inputProps: action.payload }
  }
}

export default EmojisContext
