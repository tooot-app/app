import { Dispatch } from 'react'
import { PostAction, PostState } from '../Compose'
import formatText from './formatText'

const updateText = ({
  postState,
  postDispatch,
  newText,
  type
}: {
  postState: PostState
  postDispatch: Dispatch<PostAction>
  newText: string
  type: 'emoji' | 'suggestion'
}) => {
  if (postState.text.raw.length) {
    const contentFront = postState.text.raw.slice(0, postState.selection.start)
    const contentRear = postState.text.raw.slice(postState.selection.end)

    const whiteSpaceFront = /\s/g.test(contentFront.slice(-1))
    const whiteSpaceRear = /\s/g.test(contentRear.slice(-1))

    const newTextWithSpace = `${
      whiteSpaceFront || type === 'suggestion' ? '' : ' '
    }${newText}${whiteSpaceRear ? '' : ' '}`

    formatText({
      postDispatch,
      content: [contentFront, newTextWithSpace, contentRear].join(''),
      disableDebounce: true
    })
  } else {
    formatText({
      postDispatch,
      content: `${newText} `,
      disableDebounce: true
    })
  }
}

export default updateText
