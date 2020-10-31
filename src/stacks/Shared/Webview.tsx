import React from 'react'
import { WebView } from 'react-native-webview'

// Update page title

export interface Props {
  route: {
    params: {
      uri: string
    }
  }
}

const Webview: React.FC<Props> = ({
  route: {
    params: { uri }
  }
}) => {
  return <WebView source={{ uri: uri }} />
}

export default Webview
