import React, { Dispatch } from 'react'
import { Image, Pressable } from 'react-native'

import { PostAction, PostState } from './PostMain'
import updateText from './updateText'

export interface Props {
  onChangeText: any
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const PostEmojis: React.FC<Props> = ({
  onChangeText,
  postState,
  postDispatch
}) => {
  return (
    <>
      {postState.emojis?.map((emoji, index) => (
        <Pressable
          key={index}
          onPress={() => {
            updateText({
              onChangeText,
              postState,
              newText: `:${emoji.shortcode}:`
            })

            postDispatch({ type: 'overlay', payload: null })
          }}
        >
          <Image
            key={index}
            source={{ uri: emoji.url }}
            style={{ width: 24, height: 24 }}
          />
        </Pressable>
      ))}
    </>
  )
}

export default PostEmojis
