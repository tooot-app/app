import React, { Dispatch, useCallback } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  View
} from 'react-native'
import { Feather } from '@expo/vector-icons'

import { PostAction, PostState } from '../Compose'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeAttachments: React.FC<Props> = ({ postState, postDispatch }) => {
  const renderImage = useCallback(({ item, index }) => {
    return (
      <View key={index}>
        <Image
          style={[
            styles.image,
            {
              width: (item.meta?.original?.aspect || 1) * 200
            }
          ]}
          source={{ uri: item!.preview_url }}
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
            postDispatch({
              type: 'attachments',
              payload: postState.attachments.filter(e => e.id !== item.id)
            })
          }
        />
      </View>
    )
  }, [])

  const listFooter = useCallback(() => {
    return postState.attachmentUploadProgress ? (
      <View
        style={{
          width: postState.attachmentUploadProgress.aspect * 200,
          height: 200,
          flex: 1,
          backgroundColor: 'gray',
          marginLeft: StyleConstants.Spacing.Global.PagePadding,
          marginTop: StyleConstants.Spacing.Global.PagePadding,
          marginBottom: StyleConstants.Spacing.Global.PagePadding
        }}
      >
        <ActivityIndicator />
      </View>
    ) : null
  }, [postState.attachmentUploadProgress])

  return (
    <View style={styles.base}>
      <FlatList
        horizontal
        data={postState.attachments}
        renderItem={renderImage}
        ListFooterComponent={listFooter}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    height: 200
  },
  image: {
    flex: 1,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.Global.PagePadding
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
