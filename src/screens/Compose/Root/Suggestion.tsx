import ComponentAccount from '@components/Account'
import haptics from '@components/haptics'
import ComponentHashtag from '@components/Hashtag'
import React, { useContext, useEffect } from 'react'
import ComposeContext from '../utils/createContext'
import formatText from '../utils/formatText'

type Props = { item: Mastodon.Account & Mastodon.Tag }

const ComposeRootSuggestion: React.FC<Props> = ({ item }) => {
  const { composeState, composeDispatch } = useContext(ComposeContext)

  useEffect(() => {
    if (composeState.text.raw.length === 0) {
      composeDispatch({ type: 'tag', payload: undefined })
    }
  }, [composeState.text.raw.length])

  const onPress = () => {
    const focusedInput = composeState.textInputFocus.current
    const updatedText = (): string => {
      const main = item.acct ? `@${item.acct}` : `#${item.name}`
      const textInput = composeState.textInputFocus.current
      if (composeState.tag) {
        const contentFront = composeState[textInput].raw.slice(0, composeState.tag.index)
        const contentRear = composeState[textInput].raw.slice(composeState.tag.lastIndex)

        const spaceFront =
          composeState[textInput].raw.length === 0 || /\s/g.test(contentFront.slice(-1)) ? '' : ' '
        const spaceRear = /\s/g.test(contentRear[0]) ? '' : ' '

        return [contentFront, spaceFront, main, spaceRear, contentRear].join('')
      } else {
        return composeState[textInput].raw
      }
    }
    formatText({
      textInput: focusedInput,
      composeDispatch,
      content: updatedText(),
      disableDebounce: true
    })
    haptics('Light')
  }

  return item.acct ? (
    <ComponentAccount account={item} onPress={onPress} />
  ) : (
    <ComponentHashtag hashtag={item} onPress={onPress} origin='suggestion' />
  )
}

export default ComposeRootSuggestion
