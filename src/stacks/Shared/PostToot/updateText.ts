import { PostState } from './PostMain'

const updateText = ({
  onChangeText,
  postState,
  newText
}: {
  onChangeText: any
  postState: PostState
  newText: string
}) => {
  onChangeText({
    content: postState.text.raw
      ? [
          postState.text.raw.slice(0, postState.selection.start),
          newText,
          postState.text.raw.slice(postState.selection.end)
        ].join('')
      : newText,
    disableDebounce: true
  })
}

export default updateText
