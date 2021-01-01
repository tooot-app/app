import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useTheme } from '@utils/styles/ThemeManager'
import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'

export interface Params {
  type: 'success' | 'error' | 'warning'
  position?: 'top' | 'bottom'
  message: string
  description?: string
  autoHide?: boolean
  onShow?: () => void
  onHide?: () => void
}

type Config = {
  type: Params['type']
  position: Params['position']
  text1: Params['message']
  text2: Params['description']
}

const toast = ({
  type,
  position = 'top',
  message,
  description,
  autoHide = true,
  onShow,
  onHide
}: Params) => {
  Toast.show({
    type,
    position,
    text1: message,
    text2: description,
    visibilityTime: 1500,
    autoHide,
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
  enum colorMapping {
    success = 'blue',
    error = 'red',
    warning = 'secondary'
  }

  return (
    <SafeAreaView
      style={[
        styles.base,
        { backgroundColor: theme.background, borderBottomColor: theme.primary }
      ]}
    >
      <View style={styles.container}>
        <Feather
          // @ts-ignore
          name={iconSet[config.type]}
          color={theme[colorMapping[config.type]]}
          size={StyleConstants.Font.Size.M + 2}
        />
        <View style={styles.texts}>
          <Text style={[styles.text1, { color: theme.primary }]}>
            {config.text1}
          </Text>
          {config.text2 && (
            <Text style={[styles.text2, { color: theme.secondary }]}>
              {config.text2}
            </Text>
          )}
        </View>
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
    borderBottomWidth: 1
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: StyleConstants.Spacing.L
  },
  texts: {
    marginLeft: StyleConstants.Spacing.S
  },
  text1: {
    ...StyleConstants.FontStyle.M
  },
  text2: {
    ...StyleConstants.FontStyle.S,
    marginTop: StyleConstants.Spacing.S
  }
})

export { toast, toastConfig }
