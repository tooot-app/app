import { useNavigation } from '@react-navigation/native'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionSheetIOS } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { WebView } from 'react-native-webview'
import BottomSheet from 'src/components/BottomSheet'
import BottomSheetRow from 'src/components/BottomSheet/Row'

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
  const [bottomSheet, showBottomSheet] = useState(false)
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
              icon='more-horizontal'
              onPress={() => showBottomSheet(true)}
            />
          )
        }}
      >
        {() => (
          <>
            <WebView
              ref={webview}
              source={{ uri }}
              decelerationRate='normal'
              onLoad={({ nativeEvent }) => setTitle(nativeEvent.title)}
              onError={() => setTitle(t('heading.error'))}
            />
            <BottomSheet
              visible={bottomSheet}
              handleDismiss={() => showBottomSheet(false)}
            >
              <BottomSheetRow
                onPress={() => {
                  ActionSheetIOS.showShareActionSheetWithOptions(
                    {
                      url: uri,
                      excludedActivityTypes: [
                        'com.apple.UIKit.activity.Mail',
                        'com.apple.UIKit.activity.Print',
                        'com.apple.UIKit.activity.SaveToCameraRoll',
                        'com.apple.UIKit.activity.OpenInIBooks'
                      ]
                    },
                    () => {},
                    () => {
                      showBottomSheet(false)
                    }
                  )
                }}
                icon='share'
                text={'分享链接'}
              />
              <BottomSheetRow
                onPress={() => {
                  showBottomSheet(false)
                  webview.current?.reload()
                }}
                icon='refresh-cw'
                text='刷新'
              />
            </BottomSheet>
          </>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

export default ScreenSharedWebview
