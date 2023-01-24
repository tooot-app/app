import Icon, { IconName } from '@components/Icon'
import { Loading } from '@components/Loading'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { AccessibilityProps, Pressable, View } from 'react-native'

export type Props = {
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: AccessibilityProps['accessibilityState']

  native?: boolean
  background?: boolean

  loading?: boolean
  disabled?: boolean
  destructive?: boolean

  onPress: () => void
} & ({ type?: undefined; content: IconName } | { type: 'text'; content: string })

const HeaderRight: React.FC<Props> = ({
  // Accessibility - Start
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  // Accessibility - End
  type,
  content,
  native = true,
  background = false,
  loading,
  disabled,
  destructive = false,
  onPress
}) => {
  const { colors } = useTheme()

  const loadingSpinkit = () =>
    loading ? (
      <View style={{ position: 'absolute' }}>
        <Loading />
      </View>
    ) : null

  const children = () => {
    switch (type) {
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
            {loadingSpinkit()}
          </>
        )
      default:
        return (
          <>
            <Icon
              name={content}
              style={{ opacity: loading ? 0 : 1 }}
              size={StyleConstants.Spacing.M * 1.25}
              color={disabled ? colors.secondary : destructive ? colors.red : colors.primaryDefault}
            />
            {loadingSpinkit()}
          </>
        )
    }
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole='button'
      accessibilityState={accessibilityState}
      onPress={onPress}
      children={children()}
      disabled={disabled || loading}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: background ? colors.backgroundOverlayDefault : undefined,
        minHeight: 44,
        minWidth: 44,
        marginRight: native ? -StyleConstants.Spacing.S : StyleConstants.Spacing.S,
        ...(type === undefined && {
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
