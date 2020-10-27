import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View
} from 'react-native'
import Collapsible from 'react-native-collapsible'
import ImageViewer from 'react-native-image-zoom-viewer'

import ParseContent from 'src/components/ParseContent'

function Media ({ media_attachments, sensitive, width }) {
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
              style={{ flexGrow: 1, height: width / 5, margin: 4 }}
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
      return (
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
      return <View style={styles.media}>{media_attachments}</View>
    }
  } else {
    return <></>
  }
}

export default function Content ({
  content,
  emojis,
  media_attachments,
  mentions,
  sensitive,
  spoiler_text,
  width
}) {
  const [spoilerCollapsed, setSpoilerCollapsed] = useState(true)

  return (
    <>
      {content &&
        (spoiler_text ? (
          <>
            <Text>
              {spoiler_text}{' '}
              <Text onPress={() => setSpoilerCollapsed(!spoilerCollapsed)}>
                点击展开
              </Text>
            </Text>
            <Collapsible collapsed={spoilerCollapsed}>
              <ParseContent
                content={content}
                emojis={emojis}
                emojiSize={14}
                mentions={mentions}
              />
            </Collapsible>
          </>
        ) : (
          <ParseContent
            content={content}
            emojis={emojis}
            emojiSize={14}
            mentions={mentions}
          />
        ))}
      {media_attachments.length > 0 && (
        <View
          style={{
            width: width + 8,
            height: width / 2,
            marginTop: 4,
            marginLeft: -4
          }}
        >
          <Media
            media_attachments={media_attachments}
            sensitive={sensitive}
            width={width}
          />
        </View>
      )}
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

Content.propTypes = {
  content: ParseContent.propTypes.content,
  emojis: ParseContent.propTypes.emojis,
  // media_attachments
  mentions: ParseContent.propTypes.mentions,
  sensitive: PropTypes.bool.isRequired,
  spoiler_text: PropTypes.string,
  width: PropTypes.number.isRequired
}
