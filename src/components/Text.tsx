import { StyleConstants } from '@utils/styles/constants'
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Text, TextProps, TextStyle } from 'react-native'

type Props =
  | {
      style?: Omit<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>
      fontStyle?: undefined
      fontSize?: 'S' | 'M' | 'L'
      lineHeight?: 'S' | 'M' | 'L'
      fontWeight?: 'Normal' | 'Bold'
    }
  | {
      style?: Omit<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>
      fontStyle: 'S' | 'M' | 'L'
      fontSize?: undefined
      lineHeight?: undefined
      fontWeight?: 'Normal' | 'Bold'
    }

const CustomText: React.FC<Props & TextProps> = ({
  children,
  style,
  fontStyle,
  fontSize,
  fontWeight = 'Normal',
  lineHeight,
  ...rest
}) => {
  const [isBoldText, setIsBoldText] = useState(false)
  useEffect(() => {
    const boldTextChangedSubscription = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      boldTextChanged => {
        setIsBoldText(boldTextChanged)
      }
    )

    AccessibilityInfo.isBoldTextEnabled().then(boldTextEnabled => {
      setIsBoldText(boldTextEnabled)
    })

    return () => {
      boldTextChangedSubscription.remove()
    }
  }, [])
  enum BoldMapping {
    'Normal' = '600',
    'Bold' = '800'
  }

  return (
    <Text
      style={[
        style,
        { ...(fontStyle && StyleConstants.FontStyle[fontStyle]) },
        { ...(fontSize && { fontSize: StyleConstants.Font.Size[fontSize] }) },
        {
          ...(lineHeight && {
            lineHeight: StyleConstants.Font.LineHeight[lineHeight]
          })
        },
        {
          fontWeight: isBoldText
            ? BoldMapping[fontWeight]
            : StyleConstants.Font.Weight[fontWeight]
        }
      ]}
      {...rest}
    >
      {children}
    </Text>
  )
}

export default CustomText
