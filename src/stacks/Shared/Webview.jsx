import React from 'react'
import PropTypes from 'prop-types'
import { WebView } from 'react-native-webview'

// Update page title

export default function Webview ({
  route: {
    params: { uri }
  }
}) {
  return <WebView source={{ uri: uri }} />
}

Webview.propTypes = {
  uri: PropTypes.string.isRequired
}
