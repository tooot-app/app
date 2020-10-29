import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import propTypesAttachment from 'src/prop-types/attachment'
import {
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View
} from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'

export default function Media ({ media_attachments, sensitive, width }) {
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

  let media
  let images = []
  if (width) {
    media_attachments = media_attachments.map((m, i) => {
      switch (m.type) {
        case 'unknown':
          return <Text key={i}>文件不支持</Text>
        case 'image':
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
      }
    })
    if (images) {
      media = (
        <>
          <View style={styles.media}>
            {media_attachments}
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
    } else {
      media = <View style={styles.media}>{media_attachments}</View>
    }
  } else {
    media = <></>
  }

  return (
    media_attachments.length > 0 && (
      <View
        style={{
          width: width + 8,
          height: width / 2,
          marginTop: 4,
          marginLeft: -4
        }}
      >
        {media}
      </View>
    )
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

Media.propTypes = {
  media_attachments: PropTypes.arrayOf(propTypesAttachment),
  sensitive: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired
}
