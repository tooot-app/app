import React, {
  Dispatch,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import { HeaderLeft, HeaderRight } from '@components/Header'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { PanGestureHandler } from 'react-native-gesture-handler'
import { ComposeAction } from '@screens/Shared/Compose'
import client from '@api/client'
import AttachmentVideo from '@root/components/Timelines/Timeline/Shared/Attachment/Video'

const Stack = createNativeStackNavigator()

export interface Props {
  route: {
    params: {
      attachment: Mastodon.Attachment & { local_url: string }
      composeDispatch: Dispatch<ComposeAction>
    }
  }
  navigation: any
}

const ComposeEditAttachment: React.FC<Props> = ({
  route: {
    params: { attachment, composeDispatch }
  },
  navigation
}) => {
  const { theme } = useTheme()

  const [altText, setAltText] = useState<string | undefined>(
    attachment.description
  )
  const focus = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      let needUpdate = false
      if (altText) {
        attachment.description = altText
        needUpdate = true
      }
      if (attachment.type === 'image') {
        if (focus.current.x !== 0 || focus.current.y !== 0) {
          attachment.meta!.focus = {
            x: focus.current.x > 1 ? 1 : focus.current.x,
            y: focus.current.y > 1 ? 1 : focus.current.y
          }
          needUpdate = true
        }
      }
      if (needUpdate) {
        composeDispatch({ type: 'attachmentEdit', payload: attachment })
      }
    })

    return unsubscribe
  }, [navigation, altText])

  const videoPlayback = useCallback(() => {
    return (
      <AttachmentVideo
        media_attachments={[attachment as Mastodon.AttachmentVideo]}
        width={Dimensions.get('screen').width}
      />
    )
  }, [])

  const imageFocus = useCallback(() => {
    const imageDimensionis = {
      width: Dimensions.get('screen').width,
      height:
        Dimensions.get('screen').width /
        (attachment as Mastodon.AttachmentImage).meta?.original?.aspect!
    }

    const panFocus = useRef(
      new Animated.ValueXY(
        (attachment as Mastodon.AttachmentImage).meta?.focus?.x &&
        (attachment as Mastodon.AttachmentImage).meta?.focus?.y
          ? {
              x:
                ((attachment as Mastodon.AttachmentImage).meta!.focus!.x *
                  imageDimensionis.width) /
                2,
              y:
                (-(attachment as Mastodon.AttachmentImage).meta!.focus!.y *
                  imageDimensionis.height) /
                2
            }
          : { x: 0, y: 0 }
      )
    ).current
    const panX = panFocus.x.interpolate({
      inputRange: [-imageDimensionis.width / 2, imageDimensionis.width / 2],
      outputRange: [-imageDimensionis.width / 2, imageDimensionis.width / 2],
      extrapolate: 'clamp'
    })
    const panY = panFocus.y.interpolate({
      inputRange: [-imageDimensionis.height / 2, imageDimensionis.height / 2],
      outputRange: [-imageDimensionis.height / 2, imageDimensionis.height / 2],
      extrapolate: 'clamp'
    })
    panFocus.addListener(e => {
      focus.current = {
        x: e.x / (imageDimensionis.width / 2),
        y: -e.y / (imageDimensionis.height / 2)
      }
    })
    const handleGesture = Animated.event(
      [{ nativeEvent: { translationX: panFocus.x, translationY: panFocus.y } }],
      { useNativeDriver: true }
    )
    const onHandlerStateChange = useCallback(() => {
      panFocus.extractOffset()
    }, [])

    return (
      <>
        <View style={{ overflow: 'hidden' }}>
          <Image
            style={{
              width: imageDimensionis.width,
              height: imageDimensionis.height
            }}
            source={{
              uri: attachment.local_url || attachment.preview_url
            }}
          />
          <PanGestureHandler
            onGestureEvent={handleGesture}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: -1000 + imageDimensionis.height / 2,
                  left: -1000 + imageDimensionis.width / 2,
                  transform: [{ translateX: panX }, { translateY: panY }]
                }
              ]}
            >
              <Svg width='2000' height='2000' viewBox='0 0 2000 2000'>
                <G>
                  <G id='Mask'>
                    <Path
                      d={
                        'M2000,0 L2000,2000 L0,2000 L0,0 L2000,0 Z M1000,967 C981.774603,967 967,981.774603 967,1000 C967,1018.2254 981.774603,1033 1000,1033 C1018.2254,1033 1033,1018.2254 1033,1000 C1033,981.774603 1018.2254,967 1000,967 Z'
                      }
                      fill={theme.backgroundOverlay}
                    />
                    <G transform='translate(967, 967)'>
                      <Circle
                        stroke={theme.background}
                        strokeWidth='2'
                        cx='33'
                        cy='33'
                        r='33'
                      />
                      <Circle fill={theme.background} cx='33' cy='33' r='2' />
                    </G>
                  </G>
                </G>
              </Svg>
            </Animated.View>
          </PanGestureHandler>
        </View>
        <Text style={[styles.imageFocusText, { color: theme.primary }]}>
          在预览图上拖动圆圈，以选择缩略图的焦点。
        </Text>
      </>
    )
  }, [])

  const altTextInput = useCallback(() => {
    return (
      <View style={styles.altTextContainer}>
        <Text style={[styles.altTextInputHeading, { color: theme.primary }]}>
          为附件添加文字说明
        </Text>
        <TextInput
          style={[styles.altTextInput, { borderColor: theme.border }]}
          autoCapitalize='none'
          autoCorrect={false}
          maxLength={1500}
          multiline
          onChangeText={e => setAltText(e)}
          placeholder={
            '你可以为附件添加文字说明，以便更多人可以查看他们（包括视力障碍或视力受损人士）。\n\n优质的描述应该简洁明了，但要准确地描述照片中的内容，以便用户理解其含义。'
          }
          placeholderTextColor={theme.secondary}
          scrollEnabled
          value={altText}
        />
        <Text style={[styles.altTextLength, { color: theme.secondary }]}>
          {altText?.length || 0} / 1500
        </Text>
      </View>
    )
  }, [altText])

  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
        <Stack.Navigator screenOptions={{ headerHideShadow: true }}>
          <Stack.Screen
            name='Screen-Shared-Compose-EditAttachment-Root'
            options={{
              title: '编辑附件',
              headerLeft: () => (
                <HeaderLeft
                  type='text'
                  content='取消'
                  onPress={() => navigation.goBack()}
                />
              ),
              headerRight: () => (
                <HeaderRight
                  type='text'
                  content='应用'
                  onPress={() => {
                    const formData = new FormData()

                    if (altText) {
                      formData.append('description', altText)
                    }

                    if (focus.current.x !== 0 || focus.current.y !== 0) {
                      formData.append(
                        'focus',
                        `${focus.current.x},${focus.current.y}`
                      )
                    }

                    client({
                      method: 'put',
                      instance: 'local',
                      url: `media/${attachment.id}`,
                      ...(formData && { body: formData })
                    })
                      .then(
                        res => {
                          if (res.body.id === attachment.id) {
                            Alert.alert('修改成功', '', [
                              {
                                text: '好的',
                                onPress: () => {
                                  navigation.goBack()
                                }
                              }
                            ])
                          } else {
                            Alert.alert('修改失败', '', [
                              {
                                text: '返回重试'
                              }
                            ])
                          }
                        },
                        error => {
                          Alert.alert('修改失败', error.body, [
                            {
                              text: '返回重试'
                            }
                          ])
                        }
                      )
                      .catch(() => {
                        Alert.alert('修改失败', '', [
                          {
                            text: '返回重试'
                          }
                        ])
                      })
                  }}
                />
              )
            }}
          >
            {() => {
              switch (attachment.type) {
                case 'image':
                  return (
                    <ScrollView style={{ flex: 1 }}>
                      {imageFocus()}
                      {altTextInput()}
                    </ScrollView>
                  )
                case 'video':
                case 'gifv':
                  return (
                    <ScrollView style={{ flex: 1 }}>
                      {videoPlayback()}
                      {altTextInput()}
                    </ScrollView>
                  )
              }
              return null
            }}
          </Stack.Screen>
        </Stack.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  imageFocusText: {
    fontSize: StyleConstants.Font.Size.M,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  altTextContainer: { padding: StyleConstants.Spacing.Global.PagePadding },
  altTextInputHeading: {
    fontSize: StyleConstants.Font.Size.M,
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  altTextInput: {
    height: 200,
    fontSize: StyleConstants.Font.Size.M,
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.S,
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingTop: StyleConstants.Spacing.S * 1.5,
    borderWidth: StyleSheet.hairlineWidth
  },
  altTextLength: {
    textAlign: 'right',
    marginRight: StyleConstants.Spacing.S,
    fontSize: StyleConstants.Font.Size.S,
    marginBottom: StyleConstants.Spacing.M
  }
})

export default ComposeEditAttachment
