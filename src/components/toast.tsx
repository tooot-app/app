import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useTheme } from 'src/utils/styles/ThemeManager'
import constants from 'src/utils/styles/constants'
import { Feather } from '@expo/vector-icons'

export interface Params {
  type: 'success' | 'error' | 'warning'
  position?: 'top' | 'bottom'
  content: string
  description?: string
  autoHide?: boolean
  onShow?: () => void
  onHide?: () => void
}

type Config = {
  type: Params['type']
  position: Params['position']
  text1: Params['content']
  text2: Params['description']
}

const toast = ({
  type,
  position = 'top',
  content,
  description,
  autoHide = true,
  onShow,
  onHide
}: Params) => {
  Toast.show({
    type: type,
    position: position,
    text1: content,
    text2: description,
    visibilityTime: 2000,
    autoHide: autoHide,
    topOffset: 0,
    bottomOffset: 0,
    onShow: onShow,
    onHide: onHide
  })
}

const ToastBase = ({ config }: { config: Config }) => {
  const { theme } = useTheme()
  const iconSet = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-circle'
  }

  return (
    <SafeAreaView
      style={[
        styles.base,
        { backgroundColor: theme.background, shadowColor: theme.primary }
      ]}
    >
      <View style={styles.container}>
        <Feather
          name={iconSet[config.type]}
          color={theme[config.type]}
          size={constants.FONT_SIZE_M + 2}
        />
        <Text style={[styles.text, { color: theme.primary }]}>
          {config.text1}
        </Text>
      </View>
    </SafeAreaView>
  )
}

const toastConfig = {
  success: (config: Config) => <ToastBase config={config} />,
  error: (config: Config) => <ToastBase config={config} />,
  warning: (config: Config) => <ToastBase config={config} />
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    shadowOpacity: 1,
    shadowRadius: 6
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: constants.SPACING_M
  },
  text: {
    fontSize: constants.FONT_SIZE_M,
    marginLeft: constants.SPACING_S
  }
})

export { toast, toastConfig }
