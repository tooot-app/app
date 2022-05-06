import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { Platform, TextInput, TextInputProps, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { ComponentEmojis, EmojisButton, EmojisList } from './Emojis'
import EmojisContext from './Emojis/helpers/EmojisContext'
import CustomText from './Text'

export interface Props {
  autoFocus?: boolean

  title?: string

  multiline?: boolean

  emoji?: boolean

  value?: string
  setValue:
    | Dispatch<SetStateAction<string | undefined>>
    | Dispatch<SetStateAction<string>>

  options?: Omit<
    TextInputProps,
    | 'autoFocus'
    | 'onFocus'
    | 'onBlur'
    | 'style'
    | 'onChangeText'
    | 'onSelectionChange'
    | 'keyboardAppearance'
    | 'textAlignVertical'
  >
}

const Input: React.FC<Props> = ({
  autoFocus = true,
  title,
  multiline = false,
  emoji = false,
  value,
  setValue,
  options
}) => {
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

  const selectionRange = useRef<{ start: number; end: number }>(
    value
      ? {
          start: value.length,
          end: value.length
        }
      : { start: 0, end: 0 }
  )
  const onSelectionChange = useCallback(
    ({ nativeEvent: { selection } }) => (selectionRange.current = selection),
    []
  )

  const [inputFocused, setInputFocused] = useState(false)
  useEffect(() => {
    layoutAnimation()
  }, [inputFocused])

  return (
    <ComponentEmojis
      enabled={emoji}
      value={value}
      setValue={setValue}
      selectionRange={selectionRange}
      maxLength={options?.maxLength}
    >
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
        <EmojisContext.Consumer>
          {({ emojisDispatch }) => (
            <TextInput
              autoFocus={autoFocus}
              onFocus={() => setInputFocused(true)}
              onBlur={() => {
                setInputFocused(false)
                emojisDispatch({ type: 'activate', payload: false })
              }}
              style={{
                flex: 1,
                fontSize: StyleConstants.Font.Size.M,
                color: colors.primaryDefault,
                minHeight:
                  Platform.OS === 'ios' && multiline
                    ? StyleConstants.Font.LineHeight.M * 5
                    : undefined
              }}
              onChangeText={setValue}
              onSelectionChange={onSelectionChange}
              value={value}
              {...(multiline && {
                multiline,
                numberOfLines: Platform.OS === 'android' ? 5 : undefined
              })}
              keyboardAppearance={mode}
              textAlignVertical='top'
              {...options}
            />
          )}
        </EmojisContext.Consumer>
        {title ? (
          <Animated.Text
            style={[
              animateTitle,
              { position: 'absolute', color: colors.secondary }
            ]}
          >
            {title}
          </Animated.Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
          {options?.maxLength && value?.length ? (
            <CustomText
              fontStyle='S'
              style={{
                paddingLeft: StyleConstants.Spacing.XS,
                color: colors.secondary
              }}
            >
              {value?.length} / {options.maxLength}
            </CustomText>
          ) : null}
          {inputFocused ? <EmojisButton /> : null}
        </View>
      </View>
      <EmojisList />
    </ComponentEmojis>
  )
}

export default Input
