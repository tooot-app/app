import React, { useCallback, useContext } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { ComposeContext } from '@screens/Shared/Compose'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { useNavigation } from '@react-navigation/native'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import Button from '@components/Button'
import addAttachments from '@screens/Shared/Compose/addAttachments'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const DEFAULT_HEIGHT = 200

const ComposeAttachments: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { theme } = useTheme()
  const navigation = useNavigation()

  const renderAttachment = useCallback(
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
                width:
                  ((item as Mastodon.AttachmentImage).meta?.original?.aspect ||
                    (item as Mastodon.AttachmentVideo).meta?.original.width! /
                      (item as Mastodon.AttachmentVideo).meta?.original
                        .height! ||
                    1) * DEFAULT_HEIGHT
              }
            ]}
            source={{
              uri:
                item.type === 'image'
                  ? item.local_url || item.preview_url
                  : item.preview_url
            }}
          />
          {(item as Mastodon.AttachmentVideo).meta?.original?.duration && (
            <Text
              style={[
                styles.duration,
                {
                  color: theme.background,
                  backgroundColor: theme.backgroundOverlay
                }
              ]}
            >
              {(item as Mastodon.AttachmentVideo).meta?.original.duration}
            </Text>
          )}
          <Button
            type='icon'
            content='x'
            spacing='M'
            round
            overlay
            style={styles.delete}
            onPress={() =>
              composeDispatch({
                type: 'attachments',
                payload: {
                  uploads: composeState.attachments.uploads.filter(
                    e => e.id !== item.id
                  )
                }
              })
            }
          />
          <Button
            type='icon'
            content='edit'
            spacing='M'
            round
            overlay
            style={styles.edit}
            onPress={() =>
              navigation.navigate('Screen-Shared-Compose-EditAttachment', {
                attachment: item,
                composeDispatch
              })
            }
          />
        </View>
      )
    },
    []
  )

  const listFooter = useCallback(() => {
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

    return (
      <ShimmerPlaceholder
        style={styles.progressContainer}
        visible={composeState.attachmentUploadProgress === undefined}
        width={
          (composeState.attachmentUploadProgress?.aspect || 3 / 2) *
          DEFAULT_HEIGHT
        }
        height={200}
        shimmerColors={theme.shimmer}
      >
        {composeState.attachments.uploads.length > 0 &&
          composeState.attachments.uploads[0].type === 'image' &&
          composeState.attachments.uploads.length < 4 && (
            <Pressable
              style={{
                width: DEFAULT_HEIGHT,
                height: DEFAULT_HEIGHT,
                backgroundColor: theme.border
              }}
              onPress={async () =>
                await addAttachments({ composeState, composeDispatch })
              }
            >
              <Button
                type='icon'
                content='upload-cloud'
                spacing='M'
                round
                overlay
                onPress={async () =>
                  await addAttachments({ composeState, composeDispatch })
                }
                style={{
                  position: 'absolute',
                  top:
                    (DEFAULT_HEIGHT -
                      StyleConstants.Spacing.M * 2 -
                      StyleConstants.Font.Size.M) /
                    2,
                  left:
                    (DEFAULT_HEIGHT -
                      StyleConstants.Spacing.M * 2 -
                      StyleConstants.Font.Size.M) /
                    2
                }}
              />
            </Pressable>
          )}
      </ShimmerPlaceholder>
    )
  }, [composeState.attachmentUploadProgress, composeState.attachments.uploads])

  return (
    <View style={styles.base}>
      <Pressable
        style={styles.sensitive}
        onPress={() =>
          composeDispatch({
            type: 'attachments',
            payload: { sensitive: !composeState.attachments.sensitive }
          })
        }
      >
        <Feather
          name={composeState.attachments.sensitive ? 'check-circle' : 'circle'}
          size={StyleConstants.Font.Size.L}
          color={theme.primary}
        />
        <Text style={[styles.sensitiveText, { color: theme.primary }]}>
          标记媒体为敏感内容
        </Text>
      </Pressable>
      <View style={styles.imageContainer}>
        <FlatList
          horizontal
          extraData={composeState.attachments.uploads.length}
          data={composeState.attachments.uploads}
          renderItem={renderAttachment}
          ListFooterComponent={listFooter}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.M
  },
  sensitive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: StyleConstants.Spacing.Global.PagePadding
  },
  sensitiveText: {
    ...StyleConstants.FontStyle.M,
    marginLeft: StyleConstants.Spacing.S
  },
  imageContainer: {
    height: DEFAULT_HEIGHT
  },
  image: {
    flex: 1,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.Global.PagePadding
  },
  duration: {
    position: 'absolute',
    bottom:
      StyleConstants.Spacing.Global.PagePadding + StyleConstants.Spacing.S,
    left: StyleConstants.Spacing.Global.PagePadding + StyleConstants.Spacing.S,
    ...StyleConstants.FontStyle.S,
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S,
    paddingTop: StyleConstants.Spacing.XS,
    paddingBottom: StyleConstants.Spacing.XS
  },
  delete: {
    position: 'absolute',
    top: StyleConstants.Spacing.Global.PagePadding + StyleConstants.Spacing.S,
    right: StyleConstants.Spacing.S
  },
  edit: {
    position: 'absolute',
    bottom:
      StyleConstants.Spacing.Global.PagePadding + StyleConstants.Spacing.S,
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
