import ComponentAccount from '@components/Account'
import haptics from '@components/haptics'
import ComponentHashtag from '@components/Timelines/Hashtag'
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
      <ComponentAccount account={item} onPress={onPress} />
    ) : (
      <ComponentHashtag tag={item} onPress={onPress} />
    )
  },
  () => true
)

export default ComposeRootSuggestion
