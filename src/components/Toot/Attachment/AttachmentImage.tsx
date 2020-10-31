import React, { useEffect, useState } from 'react'
import { Button, Image, Modal, StyleSheet, Pressable, View } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'

export interface Props {
  media_attachments: mastodon.Attachment[]
  sensitive: boolean
  width: number
}

const AttachmentImage: React.FC<Props> = ({
  media_attachments,
  sensitive,
  width
}) => {
  const [mediaSensitive, setMediaSensitive] = useState(sensitive)
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [imageModalIndex, setImageModalIndex] = useState(0)
  useEffect(() => {
    if (sensitive && mediaSensitive === false) {
      setTimeout(() => {
        setMediaSensitive(true)
      }, 10000)
    }
  }, [mediaSensitive])

  let images: { url: string; width: number; height: number }[] = []
  const imagesNode = media_attachments.map((m, i) => {
    images.push({
      url: m.url,
      width: m.meta.original.width,
      height: m.meta.original.height
    })
    return (
      <Pressable
        key={i}
        style={{ flexGrow: 1, height: width / 2, margin: 4 }}
        onPress={() => {
          setImageModalIndex(i)
          setImageModalVisible(true)
        }}
      >
        <Image
          source={{ uri: m.preview_url }}
          style={styles.image}
          blurRadius={mediaSensitive ? width / 5 : 0}
        />
      </Pressable>
    )
  })

  return (
    <>
      <View style={styles.media}>
        {imagesNode}
        {mediaSensitive && (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}
          >
            <Button
              title='Press me'
              onPress={() => {
                setMediaSensitive(false)
              }}
            />
          </View>
        )}
      </View>
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
        />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  media: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    alignContent: 'stretch'
  },
  image: {
    width: '100%',
    height: '100%'
  }
})

export default AttachmentImage
