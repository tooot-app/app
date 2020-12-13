import React from 'react'
import {
  Alert,
  AlertButton,
  AlertOptions,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  text: string
  destructive?: boolean
  alertOption?: {
    title: string
    message?: string | undefined
    buttons?: AlertButton[] | undefined
    options?: AlertOptions | undefined
  }
}

const Core: React.FC<Props> = ({ text, destructive = false }) => {
  const { theme } = useTheme()

  return (
    <View style={styles.core}>
      <Text style={{ color: destructive ? theme.error : theme.primary }}>
        {text}
      </Text>
    </View>
  )
}

const MenuButton: React.FC<Props> = ({ ...props }) => {
  const { theme } = useTheme()

  return (
    <Pressable
      style={[styles.base, { borderBottomColor: theme.separator }]}
      onPress={() =>
        props.alertOption &&
        Alert.alert(
          props.alertOption.title,
          props.alertOption.message,
          props.alertOption.buttons,
          props.alertOption.options
        )
      }
    >
      <Core {...props} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderBottomWidth: 1
  },
  core: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  }
})

export default MenuButton
