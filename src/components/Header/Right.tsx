import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { AccessibilityProps, Pressable, View } from 'react-native'
import { Flow } from 'react-native-animated-spinkit'

export interface Props {
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: AccessibilityProps['accessibilityState']

  type?: 'icon' | 'text'
  content: string
  native?: boolean
  background?: boolean

  loading?: boolean
  disabled?: boolean
  destructive?: boolean

  onPress: () => void
}

const HeaderRight: React.FC<Props> = ({
  // Accessibility - Start
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  // Accessibility - End
  type = 'icon',
  content,
  native = true,
  background = false,
  loading,
  disabled,
  destructive = false,
  onPress
}) => {
  const { colors, theme } = useTheme()

  const loadingSpinkit = useMemo(
    () => (
      <View style={{ position: 'absolute' }}>
        <Flow size={StyleConstants.Font.Size.M * 1.25} color={colors.secondary} />
      </View>
    ),
    [theme]
  )

  const children = useMemo(() => {
    switch (type) {
      case 'icon':
        return (
          <>
            <Icon
              name={content}
              style={{ opacity: loading ? 0 : 1 }}
              size={StyleConstants.Spacing.M * 1.25}
              color={disabled ? colors.secondary : destructive ? colors.red : colors.primaryDefault}
            />
            {loading && loadingSpinkit}
          </>
        )
      case 'text':
        return (
          <>
            <CustomText
              fontStyle='M'
              fontWeight={destructive ? 'Bold' : 'Normal'}
              style={{
                color: disabled
                  ? colors.secondary
                  : destructive
                  ? colors.red
                  : colors.primaryDefault,
                opacity: loading ? 0 : 1
              }}
              children={content}
            />
            {loading && loadingSpinkit}
          </>
        )
    }
  }, [theme, loading, disabled])

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole='button'
      accessibilityState={accessibilityState}
      onPress={onPress}
      children={children}
      disabled={disabled || loading}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: background ? colors.backgroundOverlayDefault : undefined,
        minHeight: 44,
        minWidth: 44,
        marginRight: native ? -StyleConstants.Spacing.S : StyleConstants.Spacing.S,
        ...(type === 'icon' && {
          borderRadius: 100
        }),
        ...(type === 'text' && {
          paddingHorizontal: StyleConstants.Spacing.S
        })
      }}
    />
  )
}

export default HeaderRight
