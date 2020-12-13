import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  styles: any
  onPress: () => void
  icon: any
  size?: 'S' | 'M' | 'L'
  coordinate?: 'center' | 'default'
}

const ButtomRound: React.FC<Props> = ({
  styles: extraStyles,
  onPress,
  icon,
  size = 'M',
  coordinate = 'default'
}) => {
  const { theme } = useTheme()
  const dimension =
    StyleConstants.Spacing.S * 1.5 + StyleConstants.Font.Size[size]

  return (
    <Pressable
      style={[
        styles.base,
        extraStyles,
        {
          backgroundColor: theme.backgroundOverlay,
          ...(coordinate === 'center' && {
            transform: [
              { translateX: -dimension / 2 },
              { translateY: -dimension / 2 }
            ]
          })
        }
      ]}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={StyleConstants.Font.Size[size]}
        color={theme.primaryOverlay}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    padding: StyleConstants.Spacing.S * 1.5,
    borderRadius: StyleConstants.Spacing.XL
  }
})

export default ButtomRound
