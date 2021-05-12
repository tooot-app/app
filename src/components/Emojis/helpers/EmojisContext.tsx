import { createContext, Dispatch } from 'react'

export type EmojisState = {
  enabled: boolean
  active: boolean
  emojis: { title: string; data: Mastodon.Emoji[][] }[]
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

export default EmojisContext
