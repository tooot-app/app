import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { StyleConstants } from '@utils/styles/constants'
import { Text, TextProps, TextStyle } from 'react-native'

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
  fontWeight,
  lineHeight,
  ...rest
}) => {
  const { boldTextEnabled } = useAccessibility()

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
          fontWeight: fontWeight
            ? boldTextEnabled
              ? BoldMapping[fontWeight]
              : StyleConstants.Font.Weight[fontWeight]
            : undefined
        }
      ]}
      {...rest}
      children={children}
    />
  )
}

export default CustomText
