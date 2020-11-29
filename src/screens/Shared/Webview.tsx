import { useNavigation } from '@react-navigation/native'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { WebView } from 'react-native-webview'

import { HeaderLeft, HeaderRight } from 'src/components/Header'

const Stack = createNativeStackNavigator()

export interface Props {
  route: {
    params: {
      uri: string
    }
  }
}

const ScreenSharedWebview: React.FC<Props> = ({
  route: {
    params: { uri }
  }
}) => {
  const navigation = useNavigation()
  const { t } = useTranslation('sharedWebview')
  const [title, setTitle] = useState<string>(t('heading.loading'))
  const webview = useRef<WebView>(null)

  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Screen-Shared-Webview-Root'
        options={{
          title,
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-down'
              onPress={() => navigation.goBack()}
            />
          ),
          headerRight: () => (
            <HeaderRight
              icon='refresh-cw'
              onPress={() => webview.current?.reload()}
            />
          )
        }}
      >
        {() => (
          <WebView
            ref={webview}
            source={{ uri }}
            onLoad={({ nativeEvent }) => setTitle(nativeEvent.title)}
            onError={() => setTitle(t('heading.error'))}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

export default ScreenSharedWebview
