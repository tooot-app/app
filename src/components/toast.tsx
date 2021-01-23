import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

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
  switch (Platform.OS) {
    case 'ios':
      return Toast.show({
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
    case 'android':
      return ToastAndroid.show(message, ToastAndroid.SHORT)
  }
}

const ToastBase = ({ config }: { config: Config }) => {
  const { theme } = useTheme()
  const iconSet = {
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'AlertCircle'
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
        <Icon
          name={iconSet[config.type]}
          size={StyleConstants.Font.Size.M}
          color={theme[colorMapping[config.type]]}
        />
        <View style={styles.texts}>
          <Text
            style={[styles.text1, { color: theme.primary }]}
            numberOfLines={2}
          >
            {config.text1}
          </Text>
          {config.text2 && (
            <Text
              style={[styles.text2, { color: theme.secondary }]}
              numberOfLines={2}
            >
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
  warning: (config: Config) => <ToastBase config={config} />,
  error: (config: Config) => {
    // Sentry.Native.captureException([config.text1, config.text2])
    return <ToastBase config={config} />
  }
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
    padding: StyleConstants.Spacing.M
  },
  texts: {
    marginLeft: StyleConstants.Spacing.S
  },
  text1: {
    ...StyleConstants.FontStyle.M
  },
  text2: {
    ...StyleConstants.FontStyle.S,
    marginTop: StyleConstants.Spacing.XS
  }
})

export { toast, toastConfig }
