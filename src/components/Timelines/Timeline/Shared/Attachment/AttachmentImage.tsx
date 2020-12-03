import React, { useState } from 'react'
import { Image, Modal, StyleSheet, Pressable, View } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  media_attachments: Mastodon.Attachment[]
  width: number
}

const AttachmentImage: React.FC<Props> = ({ media_attachments }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [imageModalIndex, setImageModalIndex] = useState(0)

  let images: {
    url: string
    width: number | undefined
    height: number | undefined
  }[] = []
  const imagesNode = media_attachments.map((m, i) => {
    images.push({
      url: m.url,
      width: m.meta?.original?.width || undefined,
      height: m.meta?.original?.height || undefined
    })
    return (
      <Pressable
        key={i}
        style={[styles.imageContainer]}
        onPress={() => {
          setImageModalIndex(i)
          setImageModalVisible(true)
        }}
      >
        <Image source={{ uri: m.preview_url }} style={styles.image} />
      </Pressable>
    )
  })

  return (
    <>
      <View style={[styles.media]}>{imagesNode}</View>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType='fade'
      >
        <ImageViewer
          imageUrls={images}
          index={imageModalIndex}
          onSwipeDown={() => setImageModalVisible(false)}
          enableSwipeDown={true}
          swipeDownThreshold={100}
          useNativeDriver={true}
          saveToLocalByLongPress={false}
        />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  media: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'stretch'
  },
  imageContainer: {
    flex: 1,
    flexBasis: '50%',
    padding: StyleConstants.Spacing.XS / 2
  },
  image: {
    flex: 1
  }
})

export default React.memo(AttachmentImage, () => true)
