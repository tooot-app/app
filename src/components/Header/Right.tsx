import React, { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  type?: 'icon' | 'text'
  content?: string

  loading?: boolean
  disabled?: boolean

  onPress: () => void
}

const HeaderRight: React.FC<Props> = ({
  type = 'icon',
  content,
  loading,
  disabled,
  onPress
}) => {
  const { theme } = useTheme()

  const loadingSpinkit = useMemo(
    () => (
      <View style={{ position: 'absolute' }}>
        <Chase
          size={StyleConstants.Font.Size.M * 1.25}
          color={theme.secondary}
        />
      </View>
    ),
    [theme]
  )

  const children = useMemo(() => {
    switch (type) {
      case 'icon':
        return (
          <>
            <Feather
              name={content as any}
              color={disabled ? theme.secondary : theme.primary}
              size={StyleConstants.Spacing.M * 1.25}
              style={{ opacity: loading ? 0 : 1 }}
            />
            {loading && loadingSpinkit}
          </>
        )
      case 'text':
        return (
          <>
            <Text
              style={[
                styles.text,
                {
                  color: disabled ? theme.secondary : theme.primary,
                  opacity: loading ? 0 : 1
                }
              ]}
              children={content}
            />
            {loading && loadingSpinkit}
          </>
        )
    }
  }, [theme, loading, disabled])

  return (
    <Pressable
      onPress={onPress}
      children={children}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: theme.backgroundGradientStart,
          ...(type === 'icon' && { height: 44, width: 44, marginRight: -9 })
        }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100
  },
  text: {
    fontSize: StyleConstants.Font.Size.M
  }
})

export default HeaderRight
