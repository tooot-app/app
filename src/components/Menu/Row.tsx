import Icon, { IconName } from '@components/Icon'
import { Loading } from '@components/Loading'
import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { ColorDefinitions } from '@utils/styles/themes'
import React from 'react'
import { View } from 'react-native'
import { State, Switch, TapGestureHandler } from 'react-native-gesture-handler'

export interface Props {
  iconFront?: IconName
  iconFrontColor?: ColorDefinitions

  title: string
  description?: string
  content?: string | React.ReactNode
  badge?: boolean

  switchValue?: boolean
  switchDisabled?: boolean
  switchOnValueChange?: () => void

  iconBack?: 'chevron-right' | 'chevron-down' | 'external-link' | 'check'
  iconBackColor?: ColorDefinitions

  loading?: boolean
  onPress?: () => void
}

const MenuRow: React.FC<Props> = ({
  iconFront,
  iconFrontColor = 'primaryDefault',
  title,
  description,
  content,
  badge = false,
  switchValue,
  switchDisabled,
  switchOnValueChange,
  iconBack,
  iconBackColor = 'secondary',
  loading = false,
  onPress
}) => {
  const { colors } = useTheme()
  const { screenReaderEnabled } = useAccessibility()

  return (
    <View
      style={{ minHeight: 50 }}
      accessible
      accessibilityRole={switchValue ? 'switch' : 'button'}
      accessibilityState={switchValue ? { checked: switchValue } : undefined}
    >
      <TapGestureHandler
        onHandlerStateChange={async ({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE && !loading) {
            if (screenReaderEnabled && switchOnValueChange) {
              switchOnValueChange()
            } else {
              if (onPress) onPress()
            }
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View
              style={{
                flexShrink: 3,
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: StyleConstants.Spacing.M
              }}
            >
              {iconFront && (
                <Icon
                  name={iconFront}
                  size={StyleConstants.Font.Size.L}
                  color={colors[iconFrontColor]}
                  style={{ marginRight: StyleConstants.Spacing.S }}
                />
              )}
              {badge ? (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: colors.red,
                    borderRadius: StyleConstants.BorderRadius,
                    marginRight: StyleConstants.Spacing.S
                  }}
                />
              ) : null}
              <CustomText fontStyle='M' style={{ color: colors.primaryDefault }} numberOfLines={1}>
                {title}
              </CustomText>
            </View>

            {content || switchValue !== undefined || iconBack ? (
              <View
                style={{
                  flexShrink: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingLeft: StyleConstants.Spacing.L
                }}
              >
                {content ? (
                  typeof content === 'string' ? (
                    <CustomText
                      style={{
                        color: colors.secondary,
                        opacity: !iconBack && loading ? 0 : 1
                      }}
                      numberOfLines={1}
                    >
                      {content}
                    </CustomText>
                  ) : (
                    content
                  )
                ) : null}
                {switchValue !== undefined ? (
                  <Switch
                    value={switchValue}
                    onValueChange={switchOnValueChange}
                    disabled={switchDisabled}
                    trackColor={{ true: colors.blue, false: colors.disabled }}
                    style={{ opacity: loading ? 0 : 1 }}
                  />
                ) : null}
                {iconBack ? (
                  <Icon
                    name={iconBack}
                    size={StyleConstants.Font.Size.L}
                    color={colors[iconBackColor]}
                    style={{ marginLeft: 8, opacity: loading ? 0 : 1 }}
                  />
                ) : null}
                {loading ? (
                  <View style={{ position: 'absolute' }}>
                    <Loading />
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
          {description ? (
            <CustomText fontStyle='S' style={{ color: colors.secondary }}>
              {description}
            </CustomText>
          ) : null}
        </View>
      </TapGestureHandler>
    </View>
  )
}

export default MenuRow
