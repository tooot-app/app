import { PostState } from '../Compose'

const updateText = ({
  onChangeText,
  postState,
  newText
}: {
  onChangeText: any
  postState: PostState
  newText: string
}) => {
  if (postState.text.raw.length) {
    const contentFront = postState.text.raw.slice(0, postState.selection.start)
    const contentRear = postState.text.raw.slice(postState.selection.end)

    const whiteSpaceFront = /\s/g.test(contentFront.slice(-1))
    const whiteSpaceRear = /\s/g.test(contentRear.slice(-1))

    const newTextWithSpace = `${whiteSpaceFront ? '' : ' '}${newText}${
      whiteSpaceRear ? '' : ' '
    }`

    onChangeText({
      content: [contentFront, newTextWithSpace, contentRear].join(''),
      disableDebounce: true
    })
  } else {
    onChangeText({
      content: `${newText} `,
      disableDebounce: true
    })
  }
}

export default updateText
