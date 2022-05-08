import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { ColorDefinitions } from '@utils/styles/themes'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Flow } from 'react-native-animated-spinkit'
import { State, Switch, TapGestureHandler } from 'react-native-gesture-handler'

export interface Props {
  iconFront?: any
  iconFrontColor?: ColorDefinitions

  title: string
  description?: string
  content?: string | React.ReactNode
  badge?: boolean

  switchValue?: boolean
  switchDisabled?: boolean
  switchOnValueChange?: () => void

  iconBack?: 'ChevronRight' | 'ExternalLink'
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
  const { colors, theme } = useTheme()
  const { screenReaderEnabled } = useAccessibility()

  const loadingSpinkit = useMemo(
    () => (
      <View style={{ position: 'absolute' }}>
        <Flow
          size={StyleConstants.Font.Size.M * 1.25}
          color={colors.secondary}
        />
      </View>
    ),
    [theme]
  )

  return (
    <View
      style={styles.base}
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
          <View style={styles.core}>
            <View style={styles.front}>
              {iconFront && (
                <Icon
                  name={iconFront}
                  size={StyleConstants.Font.Size.L}
                  color={colors[iconFrontColor]}
                  style={styles.iconFront}
                />
              )}
              {badge ? (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: colors.red,
                    borderRadius: 8,
                    marginRight: StyleConstants.Spacing.S
                  }}
                />
              ) : null}
              <View style={styles.main}>
                <CustomText
                  fontStyle='M'
                  style={{ color: colors.primaryDefault }}
                  numberOfLines={1}
                >
                  {title}
                </CustomText>
              </View>
            </View>

            {content || switchValue !== undefined || iconBack ? (
              <View style={styles.back}>
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
                    style={[styles.iconBack, { opacity: loading ? 0 : 1 }]}
                  />
                ) : null}
                {loading && loadingSpinkit}
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

const styles = StyleSheet.create({
  base: {
    minHeight: 50
  },
  core: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: StyleConstants.Spacing.S
  },
  front: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  back: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: StyleConstants.Spacing.M
  },
  iconFront: {
    marginRight: StyleConstants.Spacing.S
  },
  main: {
    flex: 1
  },
  description: {
    ...StyleConstants.FontStyle.S
  },
  content: {
    ...StyleConstants.FontStyle.M
  },
  iconBack: {
    marginLeft: 8
  }
})

export default MenuRow
