import { debounce, differenceWith, isEqual } from 'lodash'
import React, { createElement, Dispatch } from 'react'
import { Text } from 'react-native'
import { RefetchOptions } from 'react-query/types/core/query'
import Autolinker from '@root/modules/autolinker'
import { useTheme } from '@utils/styles/ThemeManager'
import { PostAction, ComposeState } from '@screens/Shared/Compose'

export interface Params {
  textInput: ComposeState['textInputFocus']['current']
  composeDispatch: Dispatch<PostAction>
  content: string
  refetch?: (options?: RefetchOptions | undefined) => Promise<any>
  disableDebounce?: boolean
}

const TagText = ({ text }: { text: string }) => {
  const { theme } = useTheme()

  return <Text style={{ color: theme.link }}>{text}</Text>
}

const debouncedSuggestions = debounce(
  (composeDispatch, tag) => {
    composeDispatch({ type: 'tag', payload: tag })
  },
  500,
  {
    trailing: true
  }
)

let prevTags: ComposeState['tag'][] = []

const formatText = ({
  textInput,
  composeDispatch,
  content,
  disableDebounce = false
}: Params) => {
  const tags: ComposeState['tag'][] = []
  Autolinker.link(content, {
    email: false,
    phone: false,
    mention: 'mastodon',
    hashtag: 'twitter',
    replaceFn: props => {
      const type = props.getType()
      let newType: 'url' | 'accounts' | 'hashtags'
      switch (type) {
        case 'mention':
          newType = 'accounts'
          break
        case 'hashtag':
          newType = 'hashtags'
          break
        default:
          newType = 'url'
          break
      }
      tags.push({
        type: newType,
        text: props.getMatchedText(),
        offset: props.getOffset(),
        length: props.getMatchedText().length
      })
      return
    }
  })

  const changedTag = differenceWith(tags, prevTags, isEqual)
  if (changedTag.length && !disableDebounce) {
    if (changedTag[0]!.type !== 'url') {
      debouncedSuggestions(composeDispatch, changedTag[0])
    }
  } else {
    debouncedSuggestions.cancel()
    composeDispatch({ type: 'tag', payload: undefined })
  }
  prevTags = tags
  let _content = content
  let pointer = 0
  let contentLength: number = 0
  const children = []
  tags.forEach((tag, index) => {
    const prev = _content.substr(0, tag!.offset - pointer)
    const main = _content.substr(tag!.offset - pointer, tag!.length)
    const next = _content.substr(tag!.offset - pointer + tag!.length)
    children.push(prev)
    contentLength = contentLength + prev.length
    children.push(<TagText key={index} text={main} />)
    switch (tag!.type) {
      case 'url':
        contentLength = contentLength + 23
        break
      case 'accounts':
        contentLength =
          contentLength + main.split(new RegExp('(@.*)@?'))[1].length
        break
      case 'hashtags':
        contentLength = contentLength + main.length
        break
    }
    _content = next
    pointer = pointer + prev.length + tag!.length
  })
  children.push(_content)
  contentLength = contentLength + _content.length

  composeDispatch({
    type: textInput,
    payload: {
      count: contentLength,
      raw: content,
      formatted: createElement(Text, null, children)
    }
  })
}

export default formatText
