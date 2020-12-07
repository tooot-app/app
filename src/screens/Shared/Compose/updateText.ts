import { Dispatch } from 'react'
import { PostAction, ComposeState } from '../Compose'
import formatText from './formatText'

const updateText = ({
  origin,
  composeState,
  composeDispatch,
  newText,
  type
}: {
  origin: 'text' | 'spoiler'
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
  newText: string
  type: 'emoji' | 'suggestion'
}) => {
  if (composeState[origin].raw.length) {
    const contentFront = composeState[origin].raw.slice(
      0,
      composeState[origin].selection.start
    )
    const contentRear = composeState[origin].raw.slice(
      composeState[origin].selection.end
    )

    const whiteSpaceFront = /\s/g.test(contentFront.slice(-1))
    const whiteSpaceRear = /\s/g.test(contentRear.slice(-1))

    const newTextWithSpace = `${
      whiteSpaceFront || type === 'suggestion' ? '' : ' '
    }${newText}${whiteSpaceRear ? '' : ' '}`

    formatText({
      origin,
      composeDispatch,
      content: [contentFront, newTextWithSpace, contentRear].join(''),
      disableDebounce: true
    })
  } else {
    formatText({
      origin,
      composeDispatch,
      content: `${newText} `,
      disableDebounce: true
    })
  }
}

export default updateText
