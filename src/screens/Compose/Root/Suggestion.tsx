import ComponentAccount from '@components/Account'
import analytics from '@components/analytics'
import haptics from '@components/haptics'
import ComponentHashtag from '@components/Hashtag'
import React, { Dispatch, useCallback } from 'react'
import updateText from '../updateText'
import { ComposeAction, ComposeState } from '../utils/types'

const ComposeRootSuggestion = React.memo(
  ({
    item,
    composeState,
    composeDispatch
  }: {
    item: Mastodon.Account & Mastodon.Tag
    composeState: ComposeState
    composeDispatch: Dispatch<ComposeAction>
  }) => {
    const onPress = useCallback(() => {
      analytics('compose_suggestion_press', {
        type: item.acct ? 'account' : 'hashtag'
      })
      const focusedInput = composeState.textInputFocus.current
      updateText({
        composeState: {
          ...composeState,
          [focusedInput]: {
            ...composeState[focusedInput],
            selection: {
              start: composeState.tag!.offset,
              end: composeState.tag!.offset + composeState.tag!.text.length + 1
            }
          }
        },
        composeDispatch,
        newText: item.acct ? `@${item.acct}` : `#${item.name}`,
        type: 'suggestion'
      })
      haptics('Light')
    }, [])

    return item.acct ? (
      <ComponentAccount account={item} onPress={onPress} origin='suggestion' />
    ) : (
      <ComponentHashtag hashtag={item} onPress={onPress} origin='suggestion' />
    )
  },
  () => true
)

export default ComposeRootSuggestion
