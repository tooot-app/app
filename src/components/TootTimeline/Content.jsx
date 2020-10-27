import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import HTMLView from 'react-native-htmlview'
import ImageViewer from 'react-native-image-zoom-viewer'
import { useNavigation } from '@react-navigation/native'

import Emojis from './Emojis'

function renderNode (navigation, node, index, mentions) {
  if (node.name == 'a') {
    const classes = node.attribs.class
    const href = node.attribs.href
    if (classes) {
      if (classes.includes('hashtag')) {
        return (
          <Text
            key={index}
            style={styles.a}
            onPress={() => {
              const tag = href.split(new RegExp(/\/tag\/(.*)|\/tags\/(.*)/))
              navigation.navigate('Hashtag', {
                hashtag: tag[1] || tag[2]
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      } else if (classes.includes('mention')) {
        return (
          <Text
            key={index}
            style={styles.a}
            onPress={() => {
              const username = href.split(new RegExp(/@(.*)/))
              const usernameIndex = mentions.findIndex(
                m => m.username === username[1]
              )
              navigation.navigate('Account', {
                id: mentions[usernameIndex].id
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      }
    } else {
      const domain = href.split(new RegExp(/:\/\/(.*?)\//))
      return (
        <Text
          key={index}
          style={styles.a}
          onPress={() => {
            navigation.navigate('Webview', {
              uri: href,
              domain: domain[1]
            })
          }}
        >
          {domain[1]}
        </Text>
      )
    }
  }
}

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
    const calWidth = i => {
      if (media_attachments.length === 1) {
        return { flexGrow: 1, aspectRatio: 16 / 9 }
      } else if (media_attachments.length === 3 && i === 2) {
        return { flexGrow: 1, aspectRatio: 16 / 9 }
      } else {
        return { flexBasis: width / 2 - 4, aspectRatio: 16 / 9 }
      }
    }

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
            <TouchableHighlight
              key={i}
              style={calWidth(i)}
              onPress={() => {
                setImageModalIndex(i)
                setImageModalVisible(true)
              }}
            >
              <Image
                source={{ uri: m.preview_url }}
                style={styles.image}
                blurRadius={mediaSensitive ? 50 : 0}
              />
            </TouchableHighlight>
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
  tags,
  width
}) {
  const navigation = useNavigation()

  let fullContent = []
  if (content) {
    fullContent.push(
      <HTMLView
        key='content'
        value={content}
        renderNode={(node, index) =>
          renderNode(navigation, node, index, mentions)
        }
        TextComponent={({ children }) => (
          <Emojis content={children} emojis={emojis} dimension={14} />
        )}
      />
    )
  }
  if (media_attachments) {
    fullContent.push(
      <Media
        key='media'
        media_attachments={media_attachments}
        sensitive={sensitive}
        width={width}
      />
    )
  }

  return fullContent
}

const styles = StyleSheet.create({
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  a: {
    color: 'blue'
  }
})

Content.propTypes = {
  content: PropTypes.string
}
