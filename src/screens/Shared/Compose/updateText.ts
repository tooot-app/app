import { Dispatch } from 'react'
import { PostAction, ComposeState } from '../Compose'
import formatText from './formatText'

const updateText = ({
  composeState,
  composeDispatch,
  newText,
  type
}: {
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
  newText: string
  type: 'emoji' | 'suggestion'
}) => {
  const textInput = composeState.textInputFocus.current
  if (composeState[textInput].raw.length) {
    const contentFront = composeState[textInput].raw.slice(
      0,
      composeState[textInput].selection.start
    )
    const contentRear = composeState[textInput].raw.slice(
      composeState[textInput].selection.end
    )

    const whiteSpaceFront = /\s/g.test(contentFront.slice(-1))
    const whiteSpaceRear = /\s/g.test(contentRear.slice(-1))

    const newTextWithSpace = `${
      whiteSpaceFront || type === 'suggestion' ? '' : ' '
    }${newText}${whiteSpaceRear ? '' : ' '}`

    formatText({
      textInput,
      composeDispatch,
      content: [contentFront, newTextWithSpace, contentRear].join(''),
      disableDebounce: true
    })
  } else {
    formatText({
      textInput,
      composeDispatch,
      content: `${newText} `,
      disableDebounce: true
    })
  }
}

export default updateText
