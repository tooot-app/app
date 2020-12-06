import React, { Dispatch, useCallback } from 'react'
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { PostAction, PostState } from '../Compose'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { useNavigation } from '@react-navigation/native'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'

const DEFAULT_HEIGHT = 200

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeAttachments: React.FC<Props> = ({ postState, postDispatch }) => {
  const { theme } = useTheme()
  const navigation = useNavigation()

  const imageActions = ({
    type,
    icon,
    onPress
  }: {
    type: 'edit' | 'delete'
    icon: string
    onPress: () => void
  }) => {
    return (
      <Pressable
        style={[
          styles.actions,
          styles[type],
          { backgroundColor: theme.backgroundOverlay }
        ]}
        onPress={onPress}
      >
        <Feather
          name={icon}
          size={StyleConstants.Font.Size.L}
          color={theme.primaryOverlay}
        />
      </Pressable>
    )
  }

  const renderImage = useCallback(
    ({
      item,
      index
    }: {
      item: Mastodon.Attachment & { local_url?: string }
      index: number
    }) => {
      return (
        <View key={index}>
          <Image
            style={[
              styles.image,
              {
                width: (item.meta?.original?.aspect || 1) * DEFAULT_HEIGHT
              }
            ]}
            source={{
              uri:
                item.type === 'image'
                  ? item.local_url || item.preview_url
                  : item.preview_url
            }}
          />
          {imageActions({
            type: 'delete',
            icon: 'x',
            onPress: () =>
              postDispatch({
                type: 'attachments',
                payload: postState.attachments.filter(e => e.id !== item.id)
              })
          })}
          {imageActions({
            type: 'edit',
            icon: 'edit',
            onPress: () =>
              navigation.navigate('Screen-Shared-Compose-EditAttachment', {
                attachment: item,
                postDispatch
              })
          })}
        </View>
      )
    },
    []
  )

  return (
    <View style={styles.base}>
      <FlatList
        horizontal
        data={postState.attachments}
        renderItem={renderImage}
        ListFooterComponent={
          <ShimmerPlaceholder
            style={styles.progressContainer}
            visible={postState.attachmentUploadProgress === undefined}
            width={
              (postState.attachmentUploadProgress?.aspect || 16 / 9) *
              DEFAULT_HEIGHT
            }
            height={200}
          />
        }
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    height: DEFAULT_HEIGHT
  },
  image: {
    flex: 1,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.Global.PagePadding
  },
  actions: {
    position: 'absolute',
    padding: StyleConstants.Spacing.S * 1.5,
    borderRadius: StyleConstants.Spacing.XL
  },
  edit: {
    bottom:
      StyleConstants.Spacing.Global.PagePadding + StyleConstants.Spacing.S,
    right: StyleConstants.Spacing.S
  },
  delete: {
    top: StyleConstants.Spacing.Global.PagePadding + StyleConstants.Spacing.S,
    right: StyleConstants.Spacing.S
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: DEFAULT_HEIGHT,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.Global.PagePadding
  }
})

export default ComposeAttachments
