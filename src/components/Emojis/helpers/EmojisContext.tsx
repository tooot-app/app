import { createContext, Dispatch } from 'react'

export type EmojisState = {
  enabled: boolean
  active: boolean
  emojis: {
    title: string
    data: Pick<Mastodon.Emoji, 'shortcode' | 'url' | 'static_url'>[][]
  }[]
  shortcode: Mastodon.Emoji['shortcode'] | null
}

export type EmojisAction =
  | {
      type: 'load'
      payload: NonNullable<EmojisState['emojis']>
    }
  | {
      type: 'activate'
      payload: EmojisState['active']
    }
  | {
      type: 'shortcode'
      payload: EmojisState['shortcode']
    }

type ContextType = {
  emojisState: EmojisState
  emojisDispatch: Dispatch<EmojisAction>
}
const EmojisContext = createContext<ContextType>({} as ContextType)

export const emojisReducer = (state: EmojisState, action: EmojisAction) => {
  switch (action.type) {
    case 'activate':
      return { ...state, active: action.payload }
    case 'load':
      return { ...state, emojis: action.payload }
    case 'shortcode':
      return { ...state, shortcode: action.payload }
  }
}

export default EmojisContext
