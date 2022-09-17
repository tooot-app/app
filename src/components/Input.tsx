import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Dispatch, forwardRef, RefObject, SetStateAction, useRef } from 'react'
import { Platform, TextInput, TextInputProps, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import CustomText from './Text'

export type Props = {
  value: string
  setValue: Dispatch<SetStateAction<string>>
  selectionRange?: { start: number; end: number }

  title?: string
  multiline?: boolean
} & Omit<
  TextInputProps,
  | 'style'
  | 'onChangeText'
  | 'onSelectionChange'
  | 'keyboardAppearance'
  | 'textAlignVertical'
  | 'multiline'
>

const ComponentInput = forwardRef(
  (
    { title, multiline = false, value, setValue, selectionRange, ...props }: Props,
    ref: RefObject<TextInput>
  ) => {
    const { colors, mode } = useTheme()

    const animateTitle = useAnimatedStyle(() => {
      if (value) {
        return {
          fontSize: withTiming(StyleConstants.Font.Size.S),
          paddingHorizontal: withTiming(StyleConstants.Spacing.XS),
          left: withTiming(StyleConstants.Spacing.S),
          top: withTiming(-(StyleConstants.Font.Size.S / 2) - 2),
          backgroundColor: withTiming(colors.backgroundDefault)
        }
      } else {
        return {
          fontSize: withTiming(StyleConstants.Font.Size.M),
          paddingHorizontal: withTiming(0),
          left: withTiming(StyleConstants.Spacing.S),
          top: withTiming(StyleConstants.Spacing.S + 1),
          backgroundColor: withTiming(colors.backgroundDefaultTransparent)
        }
      }
    }, [mode, value])

    return (
      <View
        style={{
          borderWidth: 1,
          marginVertical: StyleConstants.Spacing.S,
          padding: StyleConstants.Spacing.S,
          borderColor: colors.border,
          flexDirection: multiline ? 'column' : 'row',
          alignItems: 'stretch'
        }}
      >
        <TextInput
          ref={ref}
          style={{
            flex: 1,
            fontSize: StyleConstants.Font.Size.M,
            color: colors.primaryDefault,
            minHeight:
              Platform.OS === 'ios' && multiline ? StyleConstants.Font.LineHeight.M * 5 : undefined
          }}
          onChangeText={setValue}
          onSelectionChange={({ nativeEvent: { selection } }) => (selectionRange = selection)}
          value={value}
          {...(multiline && {
            multiline,
            numberOfLines: Platform.OS === 'android' ? 5 : undefined
          })}
          keyboardAppearance={mode}
          textAlignVertical='top'
          {...props}
        />

        {title ? (
          <Animated.Text style={[animateTitle, { position: 'absolute', color: colors.secondary }]}>
            {title}
          </Animated.Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
          {props?.maxLength && value?.length ? (
            <CustomText
              fontStyle='S'
              style={{
                paddingLeft: StyleConstants.Spacing.XS,
                color: colors.secondary
              }}
            >
              {value?.length} / {props.maxLength}
            </CustomText>
          ) : null}
        </View>
      </View>
    )
  }
)

export default ComponentInput
