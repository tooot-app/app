import { debounce, differenceWith, isEqual } from 'lodash'
import React, { createElement, Dispatch } from 'react'
import { Text } from 'react-native'
import { RefetchOptions } from 'react-query/types/core/query'
import Autolinker from 'src/modules/autolinker'
import { PostAction, PostState } from '../Compose'

export interface Params {
  postDispatch: Dispatch<PostAction>
  content: string
  refetch?: (options?: RefetchOptions | undefined) => Promise<any>
  disableDebounce?: boolean
}

const debouncedSuggestions = debounce(
  (postDispatch, tag) => {
    postDispatch({ type: 'tag', payload: tag })
  },
  500,
  {
    trailing: true
  }
)

let prevTags: PostState['tag'][] = []

const formatText = ({
  postDispatch,
  content,
  disableDebounce = false
}: Params) => {
  const tags: PostState['tag'][] = []
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
        offset: props.getOffset()
      })
      return
    }
  })

  const changedTag = differenceWith(tags, prevTags, isEqual)
  // quick delete causes flicking of suggestion box
  if (changedTag.length && !disableDebounce) {
    if (changedTag[0]!.type !== 'url') {
      debouncedSuggestions(postDispatch, changedTag[0])
    }
  } else {
    debouncedSuggestions.cancel()
    postDispatch({ type: 'tag', payload: undefined })
  }
  prevTags = tags
  let _content = content
  let contentLength: number = 0
  const children = []
  tags.forEach(tag => {
    const parts = _content.split(tag!.text)
    const prevPart = parts.shift()
    children.push(prevPart)
    contentLength = contentLength + (prevPart ? prevPart.length : 0)
    children.push(
      <Text style={{ color: 'red' }} key={Math.random()}>
        {tag!.text}
      </Text>
    )
    switch (tag!.type) {
      case 'url':
        contentLength = contentLength + 23
        break
      case 'accounts':
        contentLength =
          contentLength + tag!.text.split(new RegExp('(@.*)@?'))[1].length
        break
      case 'hashtags':
        contentLength = contentLength + tag!.text.length
        break
    }
    _content = parts.join()
  })
  children.push(_content)
  contentLength = contentLength + _content.length

  postDispatch({
    type: 'text',
    payload: {
      count: 500 - contentLength,
      raw: content,
      formatted: createElement(Text, null, children)
    }
  })
}

export default formatText
