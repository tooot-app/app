import { useTheme } from '@utils/styles/ThemeManager'
import { ActivityIndicator, ViewProps } from 'react-native'

export type Props = {
  size?: 'small' | 'large'
} & ViewProps

export const Loading: React.FC<Props> = ({ size = 'small', ...rest }) => {
  const { colors } = useTheme()

  return <ActivityIndicator size={size} color={colors.secondary} {...rest} />
}
