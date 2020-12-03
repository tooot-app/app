import React, { Children } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  children: React.ReactNode
}

const MenuContainer: React.FC<Props> = ({ children }) => {
  const { theme } = useTheme()
  // @ts-ignore
  const firstChild = Children.toArray(children)[0].type.name

  return (
    <View
      style={[
        styles.base,
        {
          ...(firstChild !== 'MenuHeader' && {
            borderTopColor: theme.separator,
            borderTopWidth: 1
          })
        }
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginBottom: StyleConstants.Spacing.L
  }
})

export default MenuContainer
