import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import { HeaderLeft, HeaderRight } from 'src/components/Header'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { PanGestureHandler } from 'react-native-gesture-handler'

const Stack = createNativeStackNavigator()

export interface Props {
  route: {
    params: {
      attachment: Mastodon.Attachment & { local_url: string }
    }
  }
}

const ComposeEditAttachment: React.FC<Props> = ({
  route: {
    params: { attachment }
  }
}) => {
  const navigation = useNavigation()
  const { theme } = useTheme()

  const [altText, setAltText] = useState<string | undefined>()

  const imageFocus = useCallback(() => {
    const imageDimensionis = {
      width: Dimensions.get('screen').width,
      height:
        Dimensions.get('screen').width / attachment.meta?.original?.aspect!
    }

    const panFocus = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
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
    const handleGesture = Animated.event(
      [{ nativeEvent: { translationX: panFocus.x, translationY: panFocus.y } }],
      { useNativeDriver: true }
    )
    const onHandlerStateChange = useCallback(() => {
      panFocus.extractOffset()
    }, [])

    return (
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
                top: -500 + imageDimensionis.height / 2,
                left: -500 + imageDimensionis.width / 2,
                transform: [{ translateX: panX }, { translateY: panY }]
              }
            ]}
          >
            <Svg width='1000px' height='1000px' viewBox='0 0 1000 1000'>
              <G>
                <G id='Mask'>
                  <Path
                    d={
                      'M1000,0 L1000,1000 L0,1000 L0,0 L1000,0 Z M500,467 C481.774603,467 467,481.774603 467,500 C467,518.225397 481.774603,533 500,533 C518.225397,533 533,518.225397 533,500 C533,481.774603 518.225397,467 500,467 Z'
                    }
                    fillOpacity='0.35'
                    fill='#000000'
                  />
                  <G transform='translate(467.000000, 467.000000)'>
                    <Circle
                      stroke='#FFFFFF'
                      strokeWidth='2'
                      cx='33'
                      cy='33'
                      r='33'
                    />
                    <Circle fill='#FFFFFF' cx='33' cy='33' r='2' />
                  </G>
                </G>
              </G>
            </Svg>
          </Animated.View>
        </PanGestureHandler>
      </View>
    )
  }, [])

  const altTextInput = useCallback(() => {
    return (
      <>
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
        />
        <Text style={[styles.altTextLength, { color: theme.secondary }]}>
          {1500 - (altText?.length || 0)}
        </Text>
      </>
    )
  }, [altText?.length])

  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
        <Stack.Navigator>
          <Stack.Screen
            name='Screen-Shared-Compose-EditAttachment-Root'
            options={{
              title: '编辑附件',
              headerLeft: () => (
                <HeaderLeft text='取消' onPress={() => navigation.goBack()} />
              ),
              headerRight: () => <HeaderRight text='应用' onPress={() => {}} />
            }}
          >
            {() => {
              switch (attachment.type) {
                case 'image':
                  return (
                    <View style={{ flex: 1 }}>
                      {imageFocus()}
                      <Text
                        style={[
                          styles.imageFocusText,
                          { color: theme.primary }
                        ]}
                      >
                        在预览图上点击或拖动圆圈，以选择缩略图的焦点。
                      </Text>
                      <View style={styles.editContainer}>{altTextInput()}</View>
                    </View>
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
  editContainer: { padding: StyleConstants.Spacing.Global.PagePadding },
  imageFocusText: {
    fontSize: StyleConstants.Font.Size.M
  },
  altTextInputHeading: {
    fontSize: StyleConstants.Font.Size.M,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginTop: StyleConstants.Spacing.XL
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
