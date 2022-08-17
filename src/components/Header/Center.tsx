import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { View } from 'react-native'

export interface Props {
  content?: string
  inverted?: boolean
  onPress?: () => void
  dropdown?: boolean
}

// Used for Android mostly
const HeaderCenter: React.FC<Props> = ({
  content,
  inverted = false,
  onPress,
  dropdown = false
}) => {
  const { colors } = useTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <CustomText
        style={{
          color: inverted ? colors.primaryOverlay : colors.primaryDefault
        }}
        fontSize='L'
        fontWeight='Bold'
        numberOfLines={1}
        children={content}
        {...(onPress && { onPress })}
      />
      {dropdown ? (
        <Icon
          name='ChevronDown'
          size={StyleConstants.Font.Size.M}
          color={colors.primaryDefault}
          style={{ marginLeft: StyleConstants.Spacing.XS }}
          strokeWidth={3}
        />
      ) : null}
    </View>
  )
}

export default HeaderCenter
