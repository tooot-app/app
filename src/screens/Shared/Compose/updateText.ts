import { Dispatch } from 'react'
import { PostAction, PostState } from '../Compose'
import formatText from './formatText'

const updateText = ({
  origin,
  postState,
  postDispatch,
  newText,
  type
}: {
  origin: 'text' | 'spoiler'
  postState: PostState
  postDispatch: Dispatch<PostAction>
  newText: string
  type: 'emoji' | 'suggestion'
}) => {
  if (postState[origin].raw.length) {
    const contentFront = postState[origin].raw.slice(
      0,
      postState[origin].selection.start
    )
    const contentRear = postState[origin].raw.slice(
      postState[origin].selection.end
    )

    const whiteSpaceFront = /\s/g.test(contentFront.slice(-1))
    const whiteSpaceRear = /\s/g.test(contentRear.slice(-1))

    const newTextWithSpace = `${
      whiteSpaceFront || type === 'suggestion' ? '' : ' '
    }${newText}${whiteSpaceRear ? '' : ' '}`

    formatText({
      origin,
      postDispatch,
      content: [contentFront, newTextWithSpace, contentRear].join(''),
      disableDebounce: true
    })
  } else {
    formatText({
      origin,
      postDispatch,
      content: `${newText} `,
      disableDebounce: true
    })
  }
}

export default updateText
