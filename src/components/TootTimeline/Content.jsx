import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Dimensions, StyleSheet, View } from 'react-native'
import HTML from 'react-native-render-html'

// !! Need to solve dimension issue

export default function Content ({ content }) {
  const [viewWidth, setViewWidth] = useState()
  return (
    content && (
      <View
        style={{ width: '100%' }}
        onLayout={e => setViewWidth(e.nativeEvent.layout.width)}
      >
        {viewWidth && (
          <HTML html={content} containerStyle={{ width: viewWidth }} />
        )}
      </View>
    )
  )
}

const styles = StyleSheet.create({
  width: 50,
  height: 50
})

Content.propTypes = {
  content: PropTypes.string
}
