import React, { Dispatch } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { PostAction, PostState } from '../Compose'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeAttachments: React.FC<Props> = ({ postState, postDispatch }) => {
  return (
    <View style={styles.base}>
      {postState.attachments.map((attachment, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: attachment.preview_url }}
          />
          <Feather
            name='edit'
            size={24}
            color='white'
            style={styles.buttonEdit}
          />
          <Feather
            name='trash-2'
            size={24}
            color='white'
            style={styles.buttonRemove}
            onPress={() =>
              postDispatch({ type: 'attachments/remove', payload: attachment })
            }
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'lightgreen'
  },
  imageContainer: {
    flexBasis: 100
  },
  image: {
    flex: 1
  },
  buttonEdit: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  buttonRemove: {
    position: 'absolute',
    top: 0,
    right: 0
  }
})

export default ComposeAttachments
