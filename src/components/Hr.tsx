import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { View, ViewStyle } from 'react-native'

const Hr: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        {
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 1,
          marginVertical: StyleConstants.Spacing.S
        },
        style
      ]}
    />
  )
}

export default Hr
