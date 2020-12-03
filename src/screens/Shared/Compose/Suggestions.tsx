import React, { Dispatch } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useQuery } from 'react-query'

import { searchFetch } from 'src/utils/fetches/searchFetch'
import { PostAction, PostState } from '../Compose'
import updateText from './updateText'

declare module 'react' {
  function memo<A, B> (
    Component: (props: A) => B
  ): (props: A) => ReactElement | null
}

const Suggestion = React.memo(
  ({ onChangeText, postState, postDispatch, item, index }) => {
    return (
      <Pressable
        key={index}
        onPress={() => {
          updateText({
            onChangeText,
            postState: {
              ...postState,
              selection: {
                start: postState.tag.offset,
                end: postState.tag.offset + postState.tag.text.length + 1
              }
            },
            newText: `@${item.acct ? item.acct : item.name} `
          })

          postDispatch({ type: 'overlay', payload: null })
        }}
      >
        <Text>{item.acct ? item.acct : item.name}</Text>
      </Pressable>
    )
  }
)

export interface Props {
  onChangeText: any
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeSuggestions: React.FC<Props> = ({
  onChangeText,
  postState,
  postDispatch
}) => {
  if (!postState.tag) {
    return <></>
  }

  const { status, data } = useQuery(
    ['Search', { type: postState.tag.type, term: postState.tag.text }],
    searchFetch,
    { retry: false }
  )

  let content
  switch (status) {
    case 'success':
      content = data[postState.tag.type].length ? (
        <FlatList
          data={data[postState.tag.type]}
          renderItem={({ item, index, separators }) => (
            <Suggestion
              onChangeText={onChangeText}
              postState={postState}
              postDispatch={postDispatch}
              item={item}
              index={index}
            />
          )}
        />
      ) : (
        <Text>空无一物</Text>
      )
      break
    case 'loading':
      content = <ActivityIndicator />
      break
    case 'error':
      content = <Text>搜索错误</Text>
      break
    default:
      content = <></>
  }

  return content
}

export default ComposeSuggestions
